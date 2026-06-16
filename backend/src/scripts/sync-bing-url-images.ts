import { mkdir, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { getRequiredDatabaseUrl } from "../config/env";
import { createDatabasePool, executeQuery } from "../database/mysql";
import { StorageService } from "../storage/storage.service";

interface TargetWordRow {
  sort_order: number | string;
  id: string;
  english: string;
  chinese: string;
}

interface ExistingAssetRow {
  id: number | string;
}

interface ExistingWordImageRow {
  id: number | string;
  image_asset_id: number | string;
  storage_type: "external" | "local" | "oss";
  storage_key: string | null;
  source_label: string | null;
}

interface BingImageResult {
  title: string;
  thumbnailUrl: string;
  mediaUrl: string;
  sourcePageUrl: string | null;
  sourceDomain: string | null;
}

interface SelectedImage {
  query: string;
  result: BingImageResult;
  publicUrl: string;
  urlKind: UrlKind;
}

interface BatchOptions {
  limit: number | null;
  offset: number;
}

type UrlKind = "thumbnail" | "media";

const DEFAULT_BOOK_CODE = "junior-high";
const SUPPORTED_BOOK_CODES = new Set(["junior-high", "senior-high", "postgraduate-redbook"]);
const DEFAULT_TARGET_WORD_LIMIT = 20;
const BING_RESULTS_PER_QUERY = 12;
const WORD_PROCESS_CONCURRENCY = 4;
const SOURCE_LABEL = "Bing URL";
const PRIMARY_SORT_ORDER = 0;
const REPORT_DIRECTORY = path.resolve(process.cwd(), "logs");
const BING_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0";

const SPECIAL_SEARCH_QUERIES: Record<string, string[]> = {
  boat: ["boat on water photo", "small boat"],
  group: ["group of students photo", "group of friends"],
  nineteen: ["number 19", "nineteen balloons"],
  party: ["birthday party photo", "party celebration"],
  marriage: ["wedding couple photo", "marriage ceremony"],
  clean: ["clean room photo", "clean desk"],
  bottle: ["water bottle photo", "bottle"],
  tail: ["dog tail photo", "animal tail"],
  very: ["very excited person", "very happy expression"],
  bag: ["school bag photo", "backpack"],
  tuesday: ["Tuesday calendar", "Tuesday"],
  cancel: ["cancel icon", "cancel sign"],
  map: ["map photo", "world map"],
  grandparent: ["grandparents photo", "grandparent with child"],
  moon: ["moon photo", "full moon"],
  be: ["letter B icon", "to be verb"],
  america: ["America map", "United States flag"],
  need: ["need help photo", "help wanted sign"],
  new: ["new label", "new sign"],
  stamp: ["postage stamp photo", "stamp"]
};

async function main() {
  const bookCode = resolveBookCodeFromArgs();
  const urlKind = resolveUrlKindFromArgs();
  const isDryRun = process.argv.includes("--dry-run");
  const shouldPruneDefaults = process.argv.includes("--prune-defaults");
  const batchOptions = resolveBatchOptionsFromArgs();
  const pool = createDatabasePool(getRequiredDatabaseUrl());
  const storage = new StorageService();
  await storage.onModuleInit();

  const report: unknown[] = [];
  const cleanupCandidateAssetIds = new Set<number>();
  let insertedCount = 0;
  let updatedCount = 0;
  let missedCount = 0;
  let prunedCount = 0;
  let cleanedAssetCount = 0;

  try {
    const words = await listTargetWords(pool, bookCode, batchOptions);

    if (words.length === 0) {
      console.log(`No words found for book "${bookCode}".`);
      return;
    }

    console.log(
      `Searching Bing image URLs for ${words.length} "${bookCode}" word(s), url kind: ${urlKind}, prune defaults: ${shouldPruneDefaults}.`
    );

    let nextWordIndex = 0;
    const workers = Array.from(
      { length: Math.min(WORD_PROCESS_CONCURRENCY, words.length) },
      async () => {
        while (true) {
          const currentWord = words[nextWordIndex];
          nextWordIndex += 1;

          if (!currentWord) {
            return;
          }

          try {
            const selectedImage = await findSelectedImage(currentWord, urlKind);

            if (!selectedImage) {
              missedCount += 1;
              report.push({
                wordId: currentWord.id,
                english: currentWord.english,
                chinese: currentWord.chinese,
                status: "missed"
              });
              console.warn(`Missed ${currentWord.id}: no usable Bing result.`);
              continue;
            }

            if (isDryRun) {
              report.push(buildReportEntry(currentWord, selectedImage, "dry-run", 0));
              console.log(
                `Dry run ${currentWord.id}: query="${selectedImage.query}" url="${selectedImage.publicUrl}"`
              );
              continue;
            }

            const assetId = await resolveOrCreateExternalAsset(pool, selectedImage.publicUrl);
            const activeDefaultImages = await listActiveDefaultImages(pool, currentWord.id);
            const existingSameAsset = activeDefaultImages.find(
              (image) => Number(image.image_asset_id) === assetId
            );
            const primaryRow =
              existingSameAsset ||
              activeDefaultImages.find((image) => image.source_label === SOURCE_LABEL) ||
              activeDefaultImages[0] ||
              null;

            let primaryWordImageId = 0;
            let status = "inserted";

            if (primaryRow) {
              if (
                primaryRow.storage_type === "local" &&
                Number(primaryRow.image_asset_id) !== assetId
              ) {
                cleanupCandidateAssetIds.add(Number(primaryRow.image_asset_id));
              }

              await updateWordImage(pool, Number(primaryRow.id), assetId, selectedImage);
              primaryWordImageId = Number(primaryRow.id);
              updatedCount += 1;
              status = existingSameAsset ? "updated" : "updated-source";
            } else {
              primaryWordImageId = await insertWordImage(pool, currentWord.id, assetId, selectedImage);
              await insertOperationLog(pool, primaryWordImageId, currentWord.id, selectedImage);
              insertedCount += 1;
            }

            let prunedForWord = 0;

            if (shouldPruneDefaults) {
              const result = await pruneExtraDefaultImages(
                pool,
                currentWord.id,
                primaryWordImageId,
                cleanupCandidateAssetIds
              );
              prunedForWord = result.prunedCount;
              prunedCount += result.prunedCount;
            }

            report.push(buildReportEntry(currentWord, selectedImage, status, prunedForWord));
            console.log(
              `${status === "inserted" ? "Inserted" : "Updated"} ${currentWord.id}: ${selectedImage.publicUrl}`
            );
          } catch (error) {
            missedCount += 1;
            const message = error instanceof Error ? error.message : String(error);
            report.push({
              wordId: currentWord.id,
              english: currentWord.english,
              chinese: currentWord.chinese,
              status: "failed",
              error: message
            });
            console.warn(`Failed ${currentWord.id}: ${message}`);
          }
        }
      }
    );

    await Promise.all(workers);

    if (!isDryRun && shouldPruneDefaults) {
      cleanedAssetCount = await cleanupOrphanLocalAssets(pool, storage, cleanupCandidateAssetIds);
    }

    const reportPath = await writeReport(
      report,
      bookCode,
      urlKind,
      isDryRun,
      batchOptions,
      shouldPruneDefaults
    );

    console.log(
      `Finished. Inserted ${insertedCount}, updated ${updatedCount}, missed ${missedCount}, pruned ${prunedCount}, cleaned local assets ${cleanedAssetCount}. Report: ${reportPath}`
    );
  } finally {
    await pool.end();
  }
}

async function listTargetWords(
  pool: ReturnType<typeof createDatabasePool>,
  bookCode: string,
  batchOptions: BatchOptions
): Promise<TargetWordRow[]> {
  const query = `
    SELECT
      bw.sort_order,
      w.id,
      w.english,
      w.chinese
    FROM book_words bw
    INNER JOIN books b
      ON b.id = bw.book_id
    INNER JOIN words w
      ON w.id = bw.word_id
    WHERE b.code = $1
    ORDER BY bw.sort_order ASC, bw.id ASC
    ${renderBatchClause(batchOptions)}
  `;
  const params =
    batchOptions.limit === null
      ? [bookCode]
      : [bookCode, batchOptions.limit, batchOptions.offset];
  const result = await executeQuery<TargetWordRow>(pool, query, params);
  return result.rows;
}

async function findSelectedImage(
  word: TargetWordRow,
  urlKind: UrlKind
): Promise<SelectedImage | null> {
  let thumbnailFallback: SelectedImage | null = null;

  for (const query of buildSearchQueries(word)) {
    const results = await searchBingImages(query);

    for (const result of results) {
      const publicUrl = selectPublicUrl(result, urlKind);

      if (!publicUrl) {
        continue;
      }

      if (urlKind === "media" && !(await canLoadImageUrl(publicUrl))) {
        if (!thumbnailFallback) {
          const thumbnailUrl = selectPublicUrl(result, "thumbnail");

          if (thumbnailUrl) {
            thumbnailFallback = {
              query,
              result,
              publicUrl: thumbnailUrl,
              urlKind: "thumbnail"
            };
          }
        }

        console.warn(`Skipping unreachable media URL for ${word.id}: ${publicUrl}`);
        continue;
      }

      return {
        query,
        result,
        publicUrl,
        urlKind
      };
    }
  }

  return urlKind === "media" ? thumbnailFallback : null;
}

async function canLoadImageUrl(imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "User-Agent": BING_USER_AGENT,
        Range: "bytes=0-4095"
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000)
    });

    response.body?.cancel().catch(() => undefined);

    if (!response.ok && response.status !== 206) {
      return false;
    }

    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
    return Boolean(contentType?.startsWith("image/") || looksLikeImageUrl(imageUrl));
  } catch (error) {
    return false;
  }
}

function buildSearchQueries(word: TargetWordRow): string[] {
  const english = word.english.trim();
  const chinese = extractPrimaryChineseMeaning(word.chinese);
  const defaultQuery = [english, chinese].filter(Boolean).join(" ");
  const specialQueries = SPECIAL_SEARCH_QUERIES[word.id] || [];
  const orderedQueries = specialQueries.length > 0
    ? [...specialQueries, defaultQuery]
    : [defaultQuery];

  return uniqueValues(orderedQueries.filter(Boolean));
}

function extractPrimaryChineseMeaning(value: string): string {
  const chineseMatches = value.match(/[\u3400-\u9fff]+/g) || [];
  return chineseMatches[0] || value.trim();
}

async function searchBingImages(query: string): Promise<BingImageResult[]> {
  const response = await fetch(buildBingAsyncSearchUrl(query), {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      "User-Agent": BING_USER_AGENT
    },
    redirect: "follow",
    signal: AbortSignal.timeout(30000)
  });

  if (!response.ok) {
    throw new Error(`Bing image search failed for "${query}" (${response.status}).`);
  }

  return parseBingSearchResults(await response.text(), BING_RESULTS_PER_QUERY);
}

function buildBingAsyncSearchUrl(query: string): string {
  const searchUrl = new URL("https://www.bing.com/images/async");
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("first", "1");
  searchUrl.searchParams.set("count", String(BING_RESULTS_PER_QUERY));
  searchUrl.searchParams.set("async", "content");
  return searchUrl.toString();
}

function parseBingSearchResults(html: string, limit: number): BingImageResult[] {
  const results: BingImageResult[] = [];
  const seenMediaUrls = new Set<string>();
  const anchorPattern = /<a\b[^>]*class="[^"]*\biusc\b[^"]*"[^>]*\bm="([^"]+)"[^>]*>/gi;

  for (const match of html.matchAll(anchorPattern)) {
    const metadata = parseBingMetadata(match[1]);

    if (!metadata) {
      continue;
    }

    const mediaUrl = normalizeHttpUrl(metadata.murl);
    const thumbnailUrl = normalizeHttpUrl(metadata.turl) || mediaUrl;

    if (!mediaUrl || !thumbnailUrl || seenMediaUrls.has(mediaUrl)) {
      continue;
    }

    seenMediaUrls.add(mediaUrl);
    const sourcePageUrl = normalizeHttpUrl(metadata.purl);
    results.push({
      title: normalizeSearchTitle(metadata.t),
      thumbnailUrl,
      mediaUrl,
      sourcePageUrl,
      sourceDomain: sourcePageUrl ? extractHostname(sourcePageUrl) : null
    });

    if (results.length >= limit) {
      break;
    }
  }

  return results;
}

function parseBingMetadata(rawValue: string): Record<string, string> | null {
  try {
    const parsedValue = JSON.parse(decodeHtmlEntities(rawValue));
    return parsedValue && typeof parsedValue === "object"
      ? (parsedValue as Record<string, string>)
      : null;
  } catch (error) {
    return null;
  }
}

function decodeHtmlEntities(value: string): string {
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
        return decodeNumericHtmlEntity(entity);
    }
  });
}

function decodeNumericHtmlEntity(entity: string): string {
  const isHex = entity.toLowerCase().startsWith("&#x");
  const numericText = entity.slice(isHex ? 3 : 2, -1);
  const codePoint = Number.parseInt(numericText, isHex ? 16 : 10);
  return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : entity;
}

async function resolveOrCreateExternalAsset(
  pool: ReturnType<typeof createDatabasePool>,
  publicUrl: string
): Promise<number> {
  const existingResult = await executeQuery<ExistingAssetRow>(
    pool,
    `
      SELECT id
      FROM image_assets
      WHERE storage_type = 'external'
        AND public_url = $1
      LIMIT 1
    `,
    [publicUrl]
  );

  if (existingResult.rows[0]) {
    return Number(existingResult.rows[0].id);
  }

  const insertResult = await executeQuery(
    pool,
    `
      INSERT INTO image_assets (
        storage_type,
        storage_key,
        public_url,
        sha256_hash,
        mime_type,
        file_size_bytes
      )
      VALUES ('external', NULL, $1, NULL, NULL, NULL)
    `,
    [publicUrl]
  );

  return Number(insertResult.insertId);
}

async function listActiveDefaultImages(
  pool: ReturnType<typeof createDatabasePool>,
  wordId: string
): Promise<ExistingWordImageRow[]> {
  const result = await executeQuery<ExistingWordImageRow>(
    pool,
    `
      SELECT
        wi.id,
        wi.image_asset_id,
        ia.storage_type,
        ia.storage_key,
        wi.source_label
      FROM word_images wi
      JOIN image_assets ia
        ON ia.id = wi.image_asset_id
      WHERE wi.word_id = $1
        AND wi.scope = 'default'
        AND wi.status = 'active'
      ORDER BY wi.sort_order ASC, wi.id ASC
    `,
    [wordId]
  );

  return result.rows;
}

async function updateWordImage(
  pool: ReturnType<typeof createDatabasePool>,
  wordImageId: number,
  assetId: number,
  selectedImage: SelectedImage
): Promise<void> {
  await executeQuery(
    pool,
    `
      UPDATE word_images
      SET image_asset_id = $2,
          source_label = $3,
          source_credit = $4,
          sort_order = $5,
          status = 'active',
          deleted_by_user_id = NULL,
          deleted_at = NULL,
          purge_after_at = NULL
      WHERE id = $1
    `,
    [
      wordImageId,
      assetId,
      SOURCE_LABEL,
      buildSourceCredit(selectedImage),
      PRIMARY_SORT_ORDER
    ]
  );
}

async function insertWordImage(
  pool: ReturnType<typeof createDatabasePool>,
  wordId: string,
  assetId: number,
  selectedImage: SelectedImage
): Promise<number> {
  const insertResult = await executeQuery(
    pool,
    `
      INSERT INTO word_images (
        word_id,
        image_asset_id,
        scope,
        owner_user_id,
        source_label,
        source_credit,
        status,
        sort_order
      )
      VALUES ($1, $2, 'default', NULL, $3, $4, 'active', $5)
    `,
    [
      wordId,
      assetId,
      SOURCE_LABEL,
      buildSourceCredit(selectedImage),
      PRIMARY_SORT_ORDER
    ]
  );

  return Number(insertResult.insertId);
}

async function insertOperationLog(
  pool: ReturnType<typeof createDatabasePool>,
  wordImageId: number,
  wordId: string,
  selectedImage: SelectedImage
): Promise<void> {
  await executeQuery(
    pool,
    `
      INSERT INTO image_operation_logs (word_image_id, word_id, action, actor_type, note)
      VALUES ($1, $2, 'seed', 'system', $3)
    `,
    [
      wordImageId,
      wordId,
      `imported external ${selectedImage.urlKind} URL from Bing image search: ${selectedImage.query}`
    ]
  );
}

async function pruneExtraDefaultImages(
  pool: ReturnType<typeof createDatabasePool>,
  wordId: string,
  keepWordImageId: number,
  cleanupCandidateAssetIds: Set<number>
): Promise<{ prunedCount: number }> {
  const images = await listActiveDefaultImages(pool, wordId);
  const extraImages = images.filter((image) => Number(image.id) !== keepWordImageId);

  if (extraImages.length === 0) {
    return { prunedCount: 0 };
  }

  extraImages.forEach((image) => {
    if (image.storage_type === "local") {
      cleanupCandidateAssetIds.add(Number(image.image_asset_id));
    }
  });

  const extraIds = extraImages.map((image) => Number(image.id));
  await repointCommunityPosts(pool, keepWordImageId, extraIds);
  await deleteWordImagesByIds(pool, extraIds);
  return { prunedCount: extraIds.length };
}

async function repointCommunityPosts(
  pool: ReturnType<typeof createDatabasePool>,
  keepWordImageId: number,
  sourceWordImageIds: number[]
): Promise<void> {
  if (sourceWordImageIds.length === 0) {
    return;
  }

  const placeholders = sourceWordImageIds.map((_id, index) => `$${index + 2}`).join(", ");
  await executeQuery(
    pool,
    `
      UPDATE community_posts
      SET word_image_id = $1
      WHERE word_image_id IN (${placeholders})
    `,
    [keepWordImageId, ...sourceWordImageIds]
  );
}

async function deleteWordImagesByIds(
  pool: ReturnType<typeof createDatabasePool>,
  wordImageIds: number[]
): Promise<void> {
  if (wordImageIds.length === 0) {
    return;
  }

  const placeholders = wordImageIds.map((_id, index) => `$${index + 1}`).join(", ");
  await executeQuery(
    pool,
    `
      DELETE FROM word_images
      WHERE id IN (${placeholders})
    `,
    wordImageIds
  );
}

async function cleanupOrphanLocalAssets(
  pool: ReturnType<typeof createDatabasePool>,
  storage: StorageService,
  assetIds: Set<number>
): Promise<number> {
  const uniqueIds = [...assetIds].filter((id) => Number.isFinite(id) && id > 0);
  let cleanedCount = 0;

  for (const assetId of uniqueIds) {
    const result = await executeQuery<{
      id: number | string;
      storage_key: string | null;
      reference_count: number | string;
    }>(
      pool,
      `
        SELECT
          ia.id,
          ia.storage_key,
          COUNT(wi.id) AS reference_count
        FROM image_assets ia
        LEFT JOIN word_images wi
          ON wi.image_asset_id = ia.id
        WHERE ia.id = $1
          AND ia.storage_type = 'local'
        GROUP BY ia.id, ia.storage_key
      `,
      [assetId]
    );

    const row = result.rows[0];

    if (!row || Number(row.reference_count) > 0) {
      continue;
    }

    if (row.storage_key) {
      await storage.deleteLocalFile(row.storage_key).catch(() => undefined);
    }

    await executeQuery(pool, `DELETE FROM image_assets WHERE id = $1`, [assetId]);
    cleanedCount += 1;
  }

  return cleanedCount;
}

async function writeReport(
  report: unknown[],
  bookCode: string,
  urlKind: UrlKind,
  isDryRun: boolean,
  batchOptions: BatchOptions,
  shouldPruneDefaults: boolean
): Promise<string> {
  await mkdir(REPORT_DIRECTORY, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const batchLabel =
    batchOptions.limit === null ? "all" : `${batchOptions.offset}-${batchOptions.offset + batchOptions.limit - 1}`;
  const reportPath = path.join(
    REPORT_DIRECTORY,
    `import-bing-url-${bookCode}-${batchLabel}-${urlKind}${shouldPruneDefaults ? "-prune" : ""}${isDryRun ? "-dry-run" : ""}-${timestamp}.json`
  );
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return reportPath;
}

function buildReportEntry(
  word: TargetWordRow,
  selectedImage: SelectedImage,
  status: string,
  prunedCount: number
) {
  return {
    wordId: word.id,
    english: word.english,
    chinese: word.chinese,
    status,
    prunedCount,
    query: selectedImage.query,
    urlKind: selectedImage.urlKind,
    publicUrl: selectedImage.publicUrl,
    mediaUrl: selectedImage.result.mediaUrl,
    thumbnailUrl: selectedImage.result.thumbnailUrl,
    sourcePageUrl: selectedImage.result.sourcePageUrl,
    sourceDomain: selectedImage.result.sourceDomain,
    title: selectedImage.result.title
  };
}

function buildSourceCredit(selectedImage: SelectedImage): string {
  return truncateText(
    [
      `query=${selectedImage.query}`,
      `kind=${selectedImage.urlKind}`,
      selectedImage.result.sourceDomain ? `source=${selectedImage.result.sourceDomain}` : null
    ]
      .filter(Boolean)
      .join(" | "),
    255
  );
}

function selectPublicUrl(result: BingImageResult, urlKind: UrlKind): string | null {
  return urlKind === "media"
    ? normalizeHttpUrl(result.mediaUrl)
    : normalizeHttpUrl(result.thumbnailUrl);
}

function normalizeHttpUrl(value?: string | null): string | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  const normalizedValue = trimmedValue.startsWith("//") ? `https:${trimmedValue}` : trimmedValue;

  try {
    const parsedUrl = new URL(normalizedValue);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
      ? parsedUrl.toString()
      : null;
  } catch (error) {
    return null;
  }
}

function normalizeSearchTitle(value?: string): string {
  return value?.trim() || "Bing image result";
}

function looksLikeImageUrl(value: string): boolean {
  try {
    const parsedUrl = new URL(value);
    return /\.(?:avif|gif|jpe?g|png|svg|webp)(?:$|[.!_~/-])/i.test(parsedUrl.pathname);
  } catch (error) {
    return /\.(?:avif|gif|jpe?g|png|svg|webp)(?:$|[.!_~/-])/i.test(value);
  }
}

function extractHostname(value: string): string | null {
  try {
    return new URL(value).hostname || null;
  } catch (error) {
    return null;
  }
}

function resolveUrlKindFromArgs(): UrlKind {
  if (process.argv.includes("--media")) {
    return "media";
  }

  return "thumbnail";
}

function resolveBookCodeFromArgs(): string {
  const rawBookCode = parseStringArg("--book") || DEFAULT_BOOK_CODE;
  const normalizedBookCode = rawBookCode.trim().toLowerCase();

  if (!SUPPORTED_BOOK_CODES.has(normalizedBookCode)) {
    throw new Error(
      `Unsupported book code "${rawBookCode}". Supported values: ${Array.from(
        SUPPORTED_BOOK_CODES
      ).join(", ")}.`
    );
  }

  return normalizedBookCode;
}

function resolveBatchOptionsFromArgs(): BatchOptions {
  const isAll = process.argv.includes("--all");
  const offset = parsePositiveIntegerArg("--offset") ?? 0;

  if (isAll) {
    return { limit: null, offset };
  }

  const limit = parsePositiveIntegerArg("--limit") ?? DEFAULT_TARGET_WORD_LIMIT;
  return { limit, offset };
}

function parsePositiveIntegerArg(flagName: string): number | null {
  const rawArg = process.argv.find((arg) => arg.startsWith(`${flagName}=`));

  if (!rawArg) {
    return null;
  }

  const parsedValue = Number(rawArg.slice(flagName.length + 1));
  return Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : null;
}

function parseStringArg(flagName: string): string | null {
  const rawArg = process.argv.find((arg) => arg.startsWith(`${flagName}=`));
  return rawArg ? rawArg.slice(flagName.length + 1) : null;
}

function renderBatchClause(batchOptions: BatchOptions): string {
  if (batchOptions.limit === null) {
    return batchOptions.offset > 0 ? `LIMIT 18446744073709551615 OFFSET ${batchOptions.offset}` : "";
  }

  return `LIMIT $2 OFFSET $3`;
}

function uniqueValues(values: string[]): string[] {
  return [...new Set(values)];
}

function truncateText(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : value.slice(0, maxLength);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
