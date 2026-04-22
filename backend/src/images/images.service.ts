import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import * as path from "node:path";
import { PoolClient } from "pg";
import { appEnv } from "../config/env";
import { DatabaseService } from "../database/database.service";
import { StorageService } from "../storage/storage.service";
import { WordsService } from "../words/words.service";

interface ImageTargetRow {
  id: string;
  word_id: string;
  status: "active" | "deleted";
}

interface UploadWordImageInput {
  storageKey: string;
  mimetype: string;
}

export interface BingSearchResult {
  id: string;
  title: string;
  thumbnailUrl: string;
  mediaUrl: string;
  sourcePageUrl: string | null;
  sourceDomain: string | null;
}

interface ImportSearchedImageInput {
  mediaUrl: string;
  thumbnailUrl?: string;
  sourcePageUrl?: string;
  title?: string;
}

interface DownloadedImageAsset {
  storageKey: string;
  sourceDomain: string | null;
}

const BING_SEARCH_RESULTS_LIMIT = 48;
const BING_ASYNC_BATCH_SIZE = 48;
const BING_MAX_FETCH_BATCHES = 2;
const REMOTE_IMAGE_DOWNLOAD_MAX_BYTES = 10 * 1024 * 1024;
const BING_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36";

@Injectable()
export class ImagesService {
  constructor(
    private readonly database: DatabaseService,
    private readonly wordsService: WordsService,
    private readonly storage: StorageService
  ) {}

  async searchBingImages(query: string) {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      throw new BadRequestException("Search query is required.");
    }

    const results = await this.collectBingSearchResults(normalizedQuery);

    return {
      results
    };
  }

  async uploadImage(wordId: string, uploadedImage: UploadWordImageInput) {
    if (!uploadedImage.storageKey) {
      throw new BadRequestException("Upload storage key is missing.");
    }

    const existingWord = await this.wordsService.getWordById(wordId);

    if (!existingWord) {
      await this.safeDeleteLocalFile(uploadedImage.storageKey);
      throw new NotFoundException("Word not found.");
    }

    try {
      return await this.database.transaction(async (client) => {
        const nextSortOrderResult = await client.query<{ next_sort_order: number | string }>(
          `
            SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order
            FROM word_images
            WHERE word_id = $1
          `,
          [wordId]
        );

        const nextSortOrder = Number(nextSortOrderResult.rows[0]?.next_sort_order || 1);
        await client.query(
          `
            INSERT INTO word_images (
              word_id,
              storage_type,
              storage_key,
              public_url,
              source_label,
              source_credit,
              status,
              sort_order
            )
            VALUES ($1, 'local', $2, NULL, 'Manual Upload', NULL, 'active', $3)
          `,
          [wordId, uploadedImage.storageKey, nextSortOrder]
        );

        const word = await this.wordsService.getWordById(wordId, client);

        if (!word) {
          throw new NotFoundException("Word not found after upload.");
        }

        return { word };
      });
    } catch (error) {
      await this.safeDeleteLocalFile(uploadedImage.storageKey);
      throw error;
    }
  }

  async importSearchedImage(wordId: string, input: ImportSearchedImageInput) {
    const existingWord = await this.wordsService.getWordById(wordId);

    if (!existingWord) {
      throw new NotFoundException("Word not found.");
    }

    const downloadedImage = await this.downloadRemoteImage(wordId, input);

    try {
      return await this.database.transaction(async (client) => {
        const nextSortOrderResult = await client.query<{ next_sort_order: number | string }>(
          `
            SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order
            FROM word_images
            WHERE word_id = $1
          `,
          [wordId]
        );

        const nextSortOrder = Number(nextSortOrderResult.rows[0]?.next_sort_order || 1);
        await client.query(
          `
            INSERT INTO word_images (
              word_id,
              storage_type,
              storage_key,
              public_url,
              source_label,
              source_credit,
              status,
              sort_order
            )
            VALUES ($1, 'local', $2, NULL, 'Bing Search', $3, 'active', $4)
          `,
          [wordId, downloadedImage.storageKey, downloadedImage.sourceDomain, nextSortOrder]
        );

        const word = await this.wordsService.getWordById(wordId, client);

        if (!word) {
          throw new NotFoundException("Word not found after import.");
        }

        return { word };
      });
    } catch (error) {
      await this.safeDeleteLocalFile(downloadedImage.storageKey);
      throw error;
    }
  }

  async deleteImage(imageId: number) {
    return this.database.transaction(async (client) => {
      const target = await this.getImageTarget(client, imageId);

      if (!target) {
        throw new NotFoundException("Image record not found.");
      }

      if (target.status !== "active") {
        throw new ConflictException("Only active images can be deleted.");
      }

      const activeCountResult = await client.query<{ count: string }>(
        `
          SELECT COUNT(*)::text AS count
          FROM word_images
          WHERE word_id = $1
            AND status = 'active'
        `,
        [target.word_id]
      );

      if (Number(activeCountResult.rows[0]?.count || "0") <= 1) {
        throw new ConflictException("Each word must keep at least one active image.");
      }

      await client.query(
        `
          UPDATE word_images
          SET
            status = 'deleted',
            deleted_at = NOW(),
            purge_after_at = NOW() + make_interval(hours => $2::int),
            updated_at = NOW()
          WHERE id = $1
        `,
        [imageId, appEnv.imagePurgeRetentionHours]
      );

      await this.insertLog(client, imageId, target.word_id, "delete", "manual delete");
      const word = await this.wordsService.getWordById(target.word_id, client);

      if (!word) {
        throw new NotFoundException("Word not found after delete.");
      }

      return { word };
    });
  }

  async restoreImage(imageId: number) {
    return this.database.transaction(async (client) => {
      const target = await this.getImageTarget(client, imageId);

      if (!target) {
        throw new NotFoundException("Image record not found.");
      }

      if (target.status !== "deleted") {
        throw new ConflictException("Only deleted images can be restored.");
      }

      await client.query(
        `
          UPDATE word_images
          SET
            status = 'active',
            deleted_at = NULL,
            purge_after_at = NULL,
            updated_at = NOW()
          WHERE id = $1
        `,
        [imageId]
      );

      await this.insertLog(client, imageId, target.word_id, "restore", "manual restore");
      const word = await this.wordsService.getWordById(target.word_id, client);

      if (!word) {
        throw new NotFoundException("Word not found after restore.");
      }

      return { word };
    });
  }

  private async getImageTarget(client: PoolClient, imageId: number): Promise<ImageTargetRow | null> {
    const result = await client.query<ImageTargetRow>(
      `
        SELECT id::text, word_id, status
        FROM word_images
        WHERE id = $1
      `,
      [imageId]
    );

    return result.rows[0] || null;
  }

  private async insertLog(
    client: PoolClient,
    imageId: number,
    wordId: string,
    action: "delete" | "restore",
    note: string
  ): Promise<void> {
    await client.query(
      `
        INSERT INTO image_operation_logs (word_image_id, word_id, action, actor_type, note)
        VALUES ($1, $2, $3, 'admin', $4)
      `,
      [imageId, wordId, action, note]
    );
  }

  private async safeDeleteLocalFile(storageKey: string): Promise<void> {
    try {
      await this.storage.deleteLocalFile(storageKey);
    } catch (error) {
      return;
    }
  }

  private async collectBingSearchResults(query: string): Promise<BingSearchResult[]> {
    const collectedResults: BingSearchResult[] = [];
    const seenMediaUrls = new Set<string>();
    let first = 1;

    for (let batchIndex = 0; batchIndex < BING_MAX_FETCH_BATCHES; batchIndex += 1) {
      const batchResults = await this.fetchBingAsyncBatch(query, first, BING_ASYNC_BATCH_SIZE);
      const nextUniqueCount = this.mergeBingSearchResults(collectedResults, seenMediaUrls, batchResults);

      if (collectedResults.length >= BING_SEARCH_RESULTS_LIMIT) {
        return collectedResults.slice(0, BING_SEARCH_RESULTS_LIMIT);
      }

      if (batchResults.length === 0 || nextUniqueCount === 0) {
        break;
      }

      first += batchResults.length;
    }

    if (collectedResults.length > 0) {
      return collectedResults.slice(0, BING_SEARCH_RESULTS_LIMIT);
    }

    const fallbackResponse = await this.fetchWithGatewayHandling(this.buildBingSearchUrl(query), {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "User-Agent": BING_USER_AGENT
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000)
    });

    if (!fallbackResponse.ok) {
      throw new BadGatewayException(`Bing image search failed (${fallbackResponse.status}).`);
    }

    const fallbackHtml = await fallbackResponse.text();
    return this.parseBingSearchResults(fallbackHtml);
  }

  private async fetchBingAsyncBatch(query: string, first: number, count: number): Promise<BingSearchResult[]> {
    const response = await this.fetchWithGatewayHandling(this.buildBingAsyncSearchUrl(query, first, count), {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "User-Agent": BING_USER_AGENT
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new BadGatewayException(`Bing async image search failed (${response.status}).`);
    }

    const html = await response.text();
    return this.parseBingSearchResults(html, count);
  }

  private mergeBingSearchResults(
    targetResults: BingSearchResult[],
    seenMediaUrls: Set<string>,
    incomingResults: BingSearchResult[]
  ): number {
    let addedCount = 0;

    incomingResults.forEach((result) => {
      if (seenMediaUrls.has(result.mediaUrl)) {
        return;
      }

      seenMediaUrls.add(result.mediaUrl);
      targetResults.push({
        ...result,
        id: `bing-${targetResults.length + 1}`
      });
      addedCount += 1;
    });

    return addedCount;
  }

  private buildBingSearchUrl(query: string): string {
    const searchUrl = new URL("https://www.bing.com/images/search");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("form", "HDRSC2");
    return searchUrl.toString();
  }

  private buildBingAsyncSearchUrl(query: string, first: number, count: number): string {
    const searchUrl = new URL("https://www.bing.com/images/async");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("first", String(Math.max(first, 1)));
    searchUrl.searchParams.set("count", String(Math.max(count, 1)));
    searchUrl.searchParams.set("async", "content");
    return searchUrl.toString();
  }

  private parseBingSearchResults(html: string, limit = BING_SEARCH_RESULTS_LIMIT): BingSearchResult[] {
    const results: BingSearchResult[] = [];
    const seenMediaUrls = new Set<string>();
    const anchorPattern = /<a\b[^>]*class="[^"]*\biusc\b[^"]*"[^>]*\bm="([^"]+)"[^>]*>/gi;

    for (const match of html.matchAll(anchorPattern)) {
      const metadata = this.parseBingMetadata(match[1]);

      if (!metadata) {
        continue;
      }

      const mediaUrl = this.normalizeHttpUrl(metadata.murl);
      const thumbnailUrl = this.normalizeHttpUrl(metadata.turl) || mediaUrl;

      if (!mediaUrl || !thumbnailUrl || seenMediaUrls.has(mediaUrl)) {
        continue;
      }

      seenMediaUrls.add(mediaUrl);
      const sourcePageUrl = this.normalizeHttpUrl(metadata.purl);
      results.push({
        id: `bing-${results.length + 1}`,
        title: this.normalizeSearchTitle(metadata.t),
        thumbnailUrl,
        mediaUrl,
        sourcePageUrl,
        sourceDomain: sourcePageUrl ? this.extractHostname(sourcePageUrl) : null
      });

      if (results.length >= limit) {
        break;
      }
    }

    return results;
  }

  private parseBingMetadata(rawValue: string): Record<string, string> | null {
    try {
      const decodedValue = this.decodeHtmlEntities(rawValue);
      const parsedValue = JSON.parse(decodedValue);
      return parsedValue && typeof parsedValue === "object" ? parsedValue as Record<string, string> : null;
    } catch (error) {
      return null;
    }
  }

  private decodeHtmlEntities(value: string): string {
    return value.replace(/&(?:quot|amp|lt|gt|apos);|&#(?:x[0-9a-fA-F]+|\d+);/g, (entity) => {
      switch (entity) {
        case "&quot;":
          return "\"";
        case "&amp;":
          return "&";
        case "&lt;":
          return "<";
        case "&gt;":
          return ">";
        case "&apos;":
          return "'";
        default:
          return this.decodeNumericHtmlEntity(entity);
      }
    });
  }

  private decodeNumericHtmlEntity(entity: string): string {
    const isHex = entity.toLowerCase().startsWith("&#x");
    const numericText = entity.slice(isHex ? 3 : 2, -1);
    const codePoint = Number.parseInt(numericText, isHex ? 16 : 10);
    return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : entity;
  }

  private normalizeHttpUrl(value?: string): string | null {
    if (!value || typeof value !== "string") {
      return null;
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return null;
    }

    const normalizedValue = trimmedValue.startsWith("//") ? `https:${trimmedValue}` : trimmedValue;

    try {
      const parsedUrl = new URL(normalizedValue);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:" ? parsedUrl.toString() : null;
    } catch (error) {
      return null;
    }
  }

  private normalizeSearchTitle(value?: string): string {
    if (!value || typeof value !== "string") {
      return "Bing image result";
    }

    return value.trim() || "Bing image result";
  }

  private extractHostname(value: string): string | null {
    try {
      return new URL(value).hostname || null;
    } catch (error) {
      return null;
    }
  }

  private async downloadRemoteImage(wordId: string, input: ImportSearchedImageInput): Promise<DownloadedImageAsset> {
    const mediaUrl = this.normalizeHttpUrl(input.mediaUrl);

    if (!mediaUrl) {
      throw new BadRequestException("Image URL is invalid.");
    }

    const response = await this.fetchWithGatewayHandling(mediaUrl, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: "https://www.bing.com/",
        "User-Agent": BING_USER_AGENT
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new BadGatewayException(`Image download failed (${response.status}).`);
    }

    const contentType = this.normalizeContentType(response.headers.get("content-type"));

    if (!contentType.startsWith("image/")) {
      throw new BadGatewayException("Selected resource is not an image.");
    }

    const contentLength = Number(response.headers.get("content-length") || "0");

    if (contentLength > REMOTE_IMAGE_DOWNLOAD_MAX_BYTES) {
      throw new BadRequestException("Selected image is larger than 10MB.");
    }

    const content = await this.readResponseBufferWithLimit(response, REMOTE_IMAGE_DOWNLOAD_MAX_BYTES);
    const storageKey = path.posix.join(
      "search-images",
      sanitizeWordId(wordId),
      `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${resolveRemoteImageExtension(contentType, mediaUrl)}`
    );

    await this.storage.writeLocalFile(storageKey, content);

    const sourcePageUrl = this.normalizeHttpUrl(input.sourcePageUrl);
    return {
      storageKey,
      sourceDomain: sourcePageUrl ? this.extractHostname(sourcePageUrl) : null
    };
  }

  private normalizeContentType(value: string | null): string {
    return value?.split(";")[0]?.trim().toLowerCase() || "";
  }

  private async readResponseBufferWithLimit(
    response: Awaited<ReturnType<typeof fetch>>,
    maxBytes: number
  ): Promise<Buffer> {
    if (!response.body) {
      const fallbackBuffer = Buffer.from(await response.arrayBuffer());

      if (fallbackBuffer.byteLength > maxBytes) {
        throw new BadRequestException("Selected image is larger than 10MB.");
      }

      return fallbackBuffer;
    }

    const reader = response.body.getReader();
    const chunks: Buffer[] = [];
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (!value) {
        continue;
      }

      totalBytes += value.byteLength;

      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new BadRequestException("Selected image is larger than 10MB.");
      }

      chunks.push(Buffer.from(value));
    }

    return Buffer.concat(chunks);
  }

  private async fetchWithGatewayHandling(
    input: string,
    init: RequestInit
  ): Promise<Awaited<ReturnType<typeof fetch>>> {
    try {
      return await fetch(input, init);
    } catch (error) {
      throw new BadGatewayException("Remote image service is unavailable.");
    }
  }
}

function sanitizeWordId(wordId: string): string {
  const normalizedValue = wordId.trim().replace(/[^a-zA-Z0-9_-]+/g, "-");
  return normalizedValue.replace(/-{2,}/g, "-").replace(/^-|-$/g, "") || "word";
}

function resolveRemoteImageExtension(contentType: string, url: string): string {
  switch (contentType) {
    case "image/avif":
      return ".avif";
    case "image/apng":
      return ".png";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/svg+xml":
      return ".svg";
    case "image/jpeg":
      return ".jpg";
    default: {
      const extension = path.extname(new URL(url).pathname).toLowerCase();
      return extension || ".jpg";
    }
  }
}
