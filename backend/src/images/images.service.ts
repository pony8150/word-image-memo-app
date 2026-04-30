import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { createHash } from "node:crypto";
import * as path from "node:path";
import { AuthenticatedUser } from "../auth/auth.service";
import { appEnv } from "../config/env";
import { DatabaseService } from "../database/database.service";
import { DatabaseClient } from "../database/mysql";
import { StorageService } from "../storage/storage.service";
import { WordsService } from "../words/words.service";

interface ImageTargetRow {
  id: string;
  word_id: string;
  image_asset_id: string;
  scope: "default" | "private";
  owner_user_id: string | null;
  status: "active" | "deleted";
}

interface UploadWordImageInput {
  tempFilePath: string;
  fileName: string;
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

interface DownloadedImageCandidate {
  content: Buffer;
  contentType: string;
  fileExtension: string;
  sourceDomain: string | null;
}

interface PersistedImageAsset {
  id: number;
  storageType: "external" | "local" | "oss";
  storageKey: string | null;
  publicUrl: string | null;
  sha256Hash: string | null;
  mimeType: string | null;
  fileSizeBytes: number | null;
}

interface ImageAssetRow {
  id: string;
  storage_type: "external" | "local" | "oss";
  storage_key: string | null;
  public_url: string | null;
  sha256_hash: string | null;
  mime_type: string | null;
  file_size_bytes: number | string | null;
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

  async uploadImage(
    wordId: string,
    user: AuthenticatedUser,
    uploadedImage: UploadWordImageInput
  ) {
    if (!uploadedImage.tempFilePath || !uploadedImage.fileName) {
      throw new BadRequestException("Uploaded image file is missing.");
    }

    const existingWord = await this.wordsService.hasWord(wordId);

    if (!existingWord) {
      await this.safeDeleteManagedFile(uploadedImage.tempFilePath);
      throw new NotFoundException("Word not found.");
    }

    const fileBuffer = await this.storage.readManagedAbsoluteFile(uploadedImage.tempFilePath);

    try {
      const asset = await this.resolveOrCreateLocalAsset(
        fileBuffer,
        this.normalizeContentType(uploadedImage.mimetype) || inferMimeTypeFromFileName(uploadedImage.fileName),
        uploadedImage.fileName
      );

      return await this.database.transaction(async (client) => {
        await this.ensurePrivateImageRelation(client, wordId, user, asset.id, {
          sourceLabel: "Manual Upload",
          sourceCredit: null
        });

        const word = await this.wordsService.getWordByIdForUser(wordId, user.id, client);

        if (!word) {
          throw new NotFoundException("Word not found after upload.");
        }

        return { word };
      });
    } finally {
      await this.safeDeleteManagedFile(uploadedImage.tempFilePath);
    }
  }

  async importSearchedImage(
    wordId: string,
    user: AuthenticatedUser,
    input: ImportSearchedImageInput
  ) {
    const existingWord = await this.wordsService.hasWord(wordId);

    if (!existingWord) {
      throw new NotFoundException("Word not found.");
    }

    const downloadedImage = await this.downloadRemoteImage(input);
    const asset = await this.resolveOrCreateLocalAsset(
      downloadedImage.content,
      downloadedImage.contentType,
      `bing${downloadedImage.fileExtension}`
    );

    return this.database.transaction(async (client) => {
      await this.ensurePrivateImageRelation(client, wordId, user, asset.id, {
        sourceLabel: "Bing Search",
        sourceCredit: downloadedImage.sourceDomain
      });

      const word = await this.wordsService.getWordByIdForUser(wordId, user.id, client);

      if (!word) {
        throw new NotFoundException("Word not found after import.");
      }

      return { word };
    });
  }

  async deleteImage(imageId: number, user: AuthenticatedUser) {
    return this.database.transaction(async (client) => {
      const target = await this.getImageTarget(client, imageId);

      if (!target) {
        throw new NotFoundException("Image record not found.");
      }

      if (target.scope === "default") {
        const hiddenResult = await client.query(
          `
            INSERT INTO user_hidden_word_images (user_id, word_image_id)
            VALUES ($1, $2)
          `,
          [user.id, imageId]
        ).catch((error: unknown) => {
          if (isDuplicateKeyError(error)) {
            throw new ConflictException("Image is already hidden for this user.");
          }

          throw error;
        });

        if (!hiddenResult) {
          throw new ConflictException("Image is already hidden for this user.");
        }

        await this.insertLog(
          client,
          imageId,
          target.word_id,
          "hide",
          "user",
          `default image hidden by ${user.email}`
        );

        const word = await this.wordsService.getWordByIdForUser(target.word_id, user.id, client);

        if (!word) {
          throw new NotFoundException("Word not found after delete.");
        }

        return { word };
      }

      if (Number(target.owner_user_id || "0") !== user.id) {
        throw new ConflictException("You can only delete your own private images.");
      }

      if (target.status !== "active") {
        throw new ConflictException("Only active private images can be deleted.");
      }

      const purgeAfterAt = new Date(
        Date.now() + appEnv.imagePurgeRetentionHours * 60 * 60 * 1000
      );

      await client.query(
        `
          UPDATE word_images
          SET
            status = 'deleted',
            deleted_by_user_id = $3,
            deleted_at = NOW(),
            purge_after_at = $2,
            updated_at = NOW()
          WHERE id = $1
        `,
        [imageId, purgeAfterAt, user.id]
      );

      await this.insertLog(
        client,
        imageId,
        target.word_id,
        "delete",
        "user",
        `private image deleted by ${user.email}`
      );

      const word = await this.wordsService.getWordByIdForUser(target.word_id, user.id, client);

      if (!word) {
        throw new NotFoundException("Word not found after delete.");
      }

      return { word };
    });
  }

  async restoreImage(imageId: number, user: AuthenticatedUser) {
    return this.database.transaction(async (client) => {
      const target = await this.getImageTarget(client, imageId);

      if (!target) {
        throw new NotFoundException("Image record not found.");
      }

      if (target.scope === "default") {
        const restoreResult = await client.query(
          `
            DELETE FROM user_hidden_word_images
            WHERE user_id = $1
              AND word_image_id = $2
          `,
          [user.id, imageId]
        );

        if (restoreResult.affectedRows === 0) {
          throw new ConflictException("Default image is not hidden for this user.");
        }

        await this.insertLog(
          client,
          imageId,
          target.word_id,
          "unhide",
          "user",
          `default image restored by ${user.email}`
        );

        const word = await this.wordsService.getWordByIdForUser(target.word_id, user.id, client);

        if (!word) {
          throw new NotFoundException("Word not found after restore.");
        }

        return { word };
      }

      if (Number(target.owner_user_id || "0") !== user.id) {
        throw new ConflictException("You can only restore your own private images.");
      }

      if (target.status !== "deleted") {
        throw new ConflictException("Only deleted private images can be restored.");
      }

      await client.query(
        `
          UPDATE word_images
          SET
            status = 'active',
            deleted_by_user_id = NULL,
            deleted_at = NULL,
            purge_after_at = NULL,
            updated_at = NOW()
          WHERE id = $1
        `,
        [imageId]
      );

      await this.insertLog(
        client,
        imageId,
        target.word_id,
        "restore",
        "user",
        `private image restored by ${user.email}`
      );

      const word = await this.wordsService.getWordByIdForUser(target.word_id, user.id, client);

      if (!word) {
        throw new NotFoundException("Word not found after restore.");
      }

      return { word };
    });
  }

  private async ensurePrivateImageRelation(
    client: DatabaseClient,
    wordId: string,
    user: AuthenticatedUser,
    assetId: number,
    source: { sourceLabel: string; sourceCredit: string | null }
  ): Promise<void> {
    const existingRelationResult = await client.query<{ id: string }>(
      `
        SELECT CAST(id AS CHAR) AS id
        FROM word_images
        WHERE word_id = $1
          AND image_asset_id = $2
          AND scope = 'private'
          AND owner_user_id = $3
          AND status = 'active'
        LIMIT 1
      `,
      [wordId, assetId, user.id]
    );

    if (existingRelationResult.rows[0]) {
      return;
    }

    const nextSortOrderResult = await client.query<{ next_sort_order: number | string }>(
      `
        SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order
        FROM word_images
        WHERE word_id = $1
          AND scope = 'private'
          AND owner_user_id = $2
          AND status = 'active'
      `,
      [wordId, user.id]
    );

    const nextSortOrder = Number(nextSortOrderResult.rows[0]?.next_sort_order || 1);
    await client.query(
      `
        INSERT INTO word_images (
          word_id,
          image_asset_id,
          scope,
          owner_user_id,
          source_label,
          source_credit,
          status,
          sort_order,
          created_by_user_id
        )
        VALUES ($1, $2, 'private', $3, $4, $5, 'active', $6, $3)
      `,
      [wordId, assetId, user.id, source.sourceLabel, source.sourceCredit, nextSortOrder]
    );
  }

  private async getImageTarget(client: DatabaseClient, imageId: number): Promise<ImageTargetRow | null> {
    const result = await client.query<ImageTargetRow>(
      `
        SELECT
          CAST(id AS CHAR) AS id,
          word_id,
          CAST(image_asset_id AS CHAR) AS image_asset_id,
          scope,
          CAST(owner_user_id AS CHAR) AS owner_user_id,
          status
        FROM word_images
        WHERE id = $1
      `,
      [imageId]
    );

    return result.rows[0] || null;
  }

  private async insertLog(
    client: DatabaseClient,
    imageId: number,
    wordId: string,
    action: "hide" | "unhide" | "delete" | "restore",
    actorType: "user" | "system",
    note: string
  ): Promise<void> {
    await client.query(
      `
        INSERT INTO image_operation_logs (word_image_id, word_id, action, actor_type, note)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [imageId, wordId, action, actorType, note]
    );
  }

  private async resolveOrCreateLocalAsset(
    content: Buffer,
    mimeType: string,
    fileName: string
  ): Promise<PersistedImageAsset> {
    const normalizedMimeType = mimeType || inferMimeTypeFromFileName(fileName);
    const sha256Hash = createHash("sha256").update(content).digest("hex");
    const existingAsset = await this.findAssetBySha256(sha256Hash);

    if (existingAsset) {
      return existingAsset;
    }

    const fileExtension = resolveStoredImageExtension(normalizedMimeType, fileName);
    const storageKey = buildAssetStorageKey(sha256Hash, fileExtension);

    await this.storage.writeLocalFile(storageKey, content);

    try {
      const insertResult = await this.database.query(
        `
          INSERT INTO image_assets (
            storage_type,
            storage_key,
            public_url,
            sha256_hash,
            mime_type,
            file_size_bytes
          )
          VALUES ('local', $1, NULL, $2, $3, $4)
        `,
        [storageKey, sha256Hash, normalizedMimeType, content.byteLength]
      );

      return {
        id: Number(insertResult.insertId),
        storageType: "local",
        storageKey,
        publicUrl: null,
        sha256Hash,
        mimeType: normalizedMimeType,
        fileSizeBytes: content.byteLength
      };
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const duplicatedAsset = await this.findAssetBySha256(sha256Hash);

        if (duplicatedAsset) {
          return duplicatedAsset;
        }
      }

      throw error;
    }
  }

  private async findAssetBySha256(sha256Hash: string): Promise<PersistedImageAsset | null> {
    const result = await this.database.query<ImageAssetRow>(
      `
        SELECT
          CAST(id AS CHAR) AS id,
          storage_type,
          storage_key,
          public_url,
          sha256_hash,
          mime_type,
          file_size_bytes
        FROM image_assets
        WHERE sha256_hash = $1
        LIMIT 1
      `,
      [sha256Hash]
    );

    const row = result.rows[0];

    if (!row) {
      return null;
    }

    return {
      id: Number(row.id),
      storageType: row.storage_type,
      storageKey: row.storage_key,
      publicUrl: row.public_url,
      sha256Hash: row.sha256_hash,
      mimeType: row.mime_type,
      fileSizeBytes:
        row.file_size_bytes === null || row.file_size_bytes === undefined
          ? null
          : Number(row.file_size_bytes)
    };
  }

  private async safeDeleteManagedFile(filePath: string): Promise<void> {
    try {
      await this.storage.deleteManagedAbsoluteFile(filePath);
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
      return parsedValue && typeof parsedValue === "object" ? (parsedValue as Record<string, string>) : null;
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

  private async downloadRemoteImage(input: ImportSearchedImageInput): Promise<DownloadedImageCandidate> {
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
    const sourcePageUrl = this.normalizeHttpUrl(input.sourcePageUrl);

    return {
      content,
      contentType,
      fileExtension: resolveStoredImageExtension(contentType, mediaUrl),
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

function buildAssetStorageKey(sha256Hash: string, extension: string): string {
  return path.posix.join(
    "assets",
    sha256Hash.slice(0, 2),
    sha256Hash.slice(2, 4),
    `${sha256Hash}${extension}`
  );
}

function inferMimeTypeFromFileName(fileName: string): string {
  const extension = path.extname(fileName).toLowerCase();

  switch (extension) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".avif":
      return "image/avif";
    case ".jpg":
    case ".jpeg":
    default:
      return "image/jpeg";
  }
}

function resolveStoredImageExtension(contentType: string, fileNameOrUrl: string): string {
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
      try {
        const url = new URL(fileNameOrUrl);
        const extension = path.extname(url.pathname).toLowerCase();
        return extension || ".jpg";
      } catch (error) {
        const extension = path.extname(fileNameOrUrl).toLowerCase();
        return extension || ".jpg";
      }
    }
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "ER_DUP_ENTRY");
}
