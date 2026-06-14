import { getRequiredDatabaseUrl } from "../config/env";
import { createDatabasePool, executeQuery } from "../database/mysql";
import { StorageService } from "../storage/storage.service";

interface GeneratedImageRow {
  word_image_id: number | string;
  word_id: string;
  image_asset_id: number | string;
}

const SUPPORTED_BOOK_CODES = new Set(["junior-high", "senior-high", "postgraduate-redbook"]);

async function main() {
  const bookCodes = resolveBookCodesFromArgs();
  const pool = createDatabasePool(getRequiredDatabaseUrl());
  const storage = new StorageService();
  await storage.onModuleInit();

  let removedCount = 0;

  try {
    for (const bookCode of bookCodes) {
      const generatedImages = await listGeneratedDefaultImages(pool, bookCode);

      if (generatedImages.length === 0) {
        console.log(`No Generated default images found for "${bookCode}".`);
        continue;
      }

      for (const row of generatedImages) {
        await executeQuery(
          pool,
          `
            INSERT INTO image_operation_logs (word_image_id, word_id, action, actor_type, note)
            VALUES ($1, $2, 'delete', 'system', $3)
          `,
          [Number(row.word_image_id), row.word_id, `removed Generated default image for ${bookCode}`]
        );

        await executeQuery(
          pool,
          `
            DELETE FROM word_images
            WHERE id = $1
          `,
          [Number(row.word_image_id)]
        );

        await cleanupUnusedAsset(storage, pool, Number(row.image_asset_id));
        removedCount += 1;
      }

      console.log(`Removed ${generatedImages.length} Generated default image(s) from "${bookCode}".`);
    }

    console.log(`Finished. Removed ${removedCount} Generated default image(s).`);
  } finally {
    await pool.end();
  }
}

async function listGeneratedDefaultImages(
  pool: ReturnType<typeof createDatabasePool>,
  bookCode: string
): Promise<GeneratedImageRow[]> {
  const result = await executeQuery<GeneratedImageRow>(
    pool,
    `
      SELECT DISTINCT
        wi.id AS word_image_id,
        wi.word_id,
        wi.image_asset_id
      FROM word_images wi
      INNER JOIN book_words bw
        ON bw.word_id = wi.word_id
      INNER JOIN books b
        ON b.id = bw.book_id
      WHERE b.code = $1
        AND wi.scope = 'default'
        AND wi.status = 'active'
        AND wi.source_label = 'Generated'
    `,
    [bookCode]
  );

  return result.rows;
}

async function cleanupUnusedAsset(
  storage: StorageService,
  pool: ReturnType<typeof createDatabasePool>,
  assetId: number
): Promise<void> {
  const referencesResult = await executeQuery<{ count: number | string }>(
    pool,
    `
      SELECT COUNT(*) AS count
      FROM word_images
      WHERE image_asset_id = $1
    `,
    [assetId]
  );

  if (Number(referencesResult.rows[0]?.count || 0) > 0) {
    return;
  }

  const assetResult = await executeQuery<{ storage_type: string; storage_key: string | null }>(
    pool,
    `
      SELECT storage_type, storage_key
      FROM image_assets
      WHERE id = $1
      LIMIT 1
    `,
    [assetId]
  );

  const asset = assetResult.rows[0];

  if (!asset) {
    return;
  }

  if (asset.storage_type === "local" && asset.storage_key) {
    await storage.deleteLocalFile(asset.storage_key);
  }

  await executeQuery(
    pool,
    `
      DELETE FROM image_assets
      WHERE id = $1
    `,
    [assetId]
  );
}

function resolveBookCodesFromArgs(): string[] {
  const requestedBookCodes = process.argv.slice(2).map((value) => String(value || "").trim().toLowerCase());
  const normalizedBookCodes = requestedBookCodes.length > 0 ? requestedBookCodes : ["senior-high", "postgraduate-redbook"];

  for (const bookCode of normalizedBookCodes) {
    if (!SUPPORTED_BOOK_CODES.has(bookCode)) {
      throw new Error(
        `Unsupported book code "${bookCode}". Supported values: ${Array.from(
          SUPPORTED_BOOK_CODES
        ).join(", ")}.`
      );
    }
  }

  return normalizedBookCodes;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
