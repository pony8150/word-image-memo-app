import { createHash } from "node:crypto";
import * as path from "node:path";
import { getRequiredDatabaseUrl } from "../config/env";
import { createDatabasePool, executeQuery } from "../database/mysql";
import { StorageService } from "../storage/storage.service";
import { downloadPexelsImageWithinLimit, PEXELS_TARGET_MAX_BYTES } from "./pexels-download";

interface PexelsWordImageRow {
  word_image_id: number | string;
  word_id: string;
  scope: "default" | "private";
  owner_user_id: number | string | null;
  image_asset_id: number | string;
  storage_type: string;
  storage_key: string | null;
  file_size_bytes: number | string | null;
}

interface ImageAssetRow {
  id: number | string;
}

interface PersistedAsset {
  id: number;
  storageKey: string;
}

const PEXELS_REFERENCE_URLS: Record<string, string> = {
  boat: "https://www.pexels.com/photo/a-small-boat-is-sitting-in-the-water-27537389/",
  group: "https://www.pexels.com/photo/group-of-friends-17355574/",
  nineteen: "https://www.pexels.com/photo/young-woman-holding-balloons-with-number-19-16235167/",
  party: "https://www.pexels.com/photo/people-celebrating-a-birthday-party-7810979/",
  marriage: "https://www.pexels.com/photo/wedding-couple-1587042/",
  clean: "https://www.pexels.com/photo/a-clean-room-10588590/",
  bottle: "https://www.pexels.com/photo/bottle-with-water-14946509/",
  tail: "https://www.pexels.com/photo/dog-s-tail-3299902/",
  very: "https://www.pexels.com/photo/a-smiling-woman-looking-very-excited-6250961/",
  bag: "https://www.pexels.com/photo/a-student-holding-a-backpack-13198544/",
  tuesday: "https://images.pexels.com/photos/7428211/pexels-photo-7428211.jpeg",
  cancel: "https://images.pexels.com/photos/4004291/pexels-photo-4004291.jpeg",
  map: "https://images.pexels.com/photos/7634479/pexels-photo-7634479.jpeg",
  grandparent: "https://www.pexels.com/photo/elderly-couple-1653898/",
  moon: "https://images.pexels.com/photos/30284245/pexels-photo-30284245.jpeg",
  be: "https://images.pexels.com/photos/8154070/pexels-photo-8154070.jpeg",
  america: "https://images.pexels.com/photos/16135529/pexels-photo-16135529.jpeg",
  need: "https://images.pexels.com/photos/7640817/pexels-photo-7640817.jpeg",
  new: "https://images.pexels.com/photos/12279148/pexels-photo-12279148.jpeg",
  stamp: "https://images.pexels.com/photos/7462696/pexels-photo-7462696.jpeg"
};

async function main() {
  const pool = createDatabasePool(getRequiredDatabaseUrl());
  const storage = new StorageService();
  await storage.onModuleInit();

  let optimizedCount = 0;
  let skippedCount = 0;

  try {
    const targetRows = await listTargetPexelsWordImages(pool);

    for (const row of targetRows) {
      const currentFileSize = Number(row.file_size_bytes || 0);

      if (currentFileSize > 0 && currentFileSize <= PEXELS_TARGET_MAX_BYTES) {
        skippedCount += 1;
        console.log(`Skipping ${row.word_id} (${row.scope}): already ${currentFileSize} bytes.`);
        continue;
      }

      const referenceUrl = PEXELS_REFERENCE_URLS[row.word_id];

      if (!referenceUrl) {
        throw new Error(`Missing Pexels reference URL for "${row.word_id}".`);
      }

      console.log(`Optimizing ${row.word_id} (${row.scope}) from ${currentFileSize} bytes...`);
      const downloadedImage = await downloadPexelsImageWithinLimit(referenceUrl, PEXELS_TARGET_MAX_BYTES);
      const nextAsset = await resolveOrCreateLocalAsset(
        storage,
        pool,
        downloadedImage.content,
        downloadedImage.mimeType,
        downloadedImage.optimizedUrl
      );

      const previousAssetId = Number(row.image_asset_id);

      if (nextAsset.id !== previousAssetId) {
        await executeQuery(
          pool,
          `
            UPDATE word_images
            SET image_asset_id = $1
            WHERE id = $2
          `,
          [nextAsset.id, Number(row.word_image_id)]
        );
      }

      await executeQuery(
        pool,
        `
          INSERT INTO image_operation_logs (word_image_id, word_id, action, actor_type, note)
          VALUES ($1, $2, 'seed', 'system', $3)
        `,
        [
          Number(row.word_image_id),
          row.word_id,
          `optimized Pexels image to ${downloadedImage.byteLength} bytes using ${downloadedImage.optimizedUrl}`
        ]
      );

      if (nextAsset.id !== previousAssetId) {
        await cleanupUnusedAsset(storage, pool, previousAssetId);
      }

      optimizedCount += 1;
      console.log(`Optimized ${row.word_id} -> ${downloadedImage.byteLength} bytes`);
    }

    console.log(`Finished. Optimized ${optimizedCount} image(s), skipped ${skippedCount}.`);
  } finally {
    await pool.end();
  }
}

async function listTargetPexelsWordImages(
  pool: ReturnType<typeof createDatabasePool>
): Promise<PexelsWordImageRow[]> {
  const wordIds = Object.keys(PEXELS_REFERENCE_URLS);
  const placeholders = wordIds.map((_wordId, index) => `$${index + 1}`).join(", ");
  const result = await executeQuery<PexelsWordImageRow>(
    pool,
    `
      SELECT
        CAST(wi.id AS CHAR) AS word_image_id,
        wi.word_id,
        wi.scope,
        CAST(wi.owner_user_id AS CHAR) AS owner_user_id,
        CAST(wi.image_asset_id AS CHAR) AS image_asset_id,
        ia.storage_type,
        ia.storage_key,
        ia.file_size_bytes
      FROM word_images wi
      INNER JOIN image_assets ia
        ON ia.id = wi.image_asset_id
      WHERE wi.status = 'active'
        AND wi.source_label = 'Pexels'
        AND wi.word_id IN (${placeholders})
      ORDER BY wi.word_id ASC, wi.id ASC
    `,
    wordIds
  );

  return result.rows;
}

async function resolveOrCreateLocalAsset(
  storage: StorageService,
  pool: ReturnType<typeof createDatabasePool>,
  content: Buffer,
  mimeType: string,
  sourceUrl: string
): Promise<PersistedAsset> {
  const sha256Hash = createHash("sha256").update(content).digest("hex");
  const existingResult = await executeQuery<ImageAssetRow>(
    pool,
    `
      SELECT id
      FROM image_assets
      WHERE sha256_hash = $1
      LIMIT 1
    `,
    [sha256Hash]
  );

  if (existingResult.rows[0]) {
    return {
      id: Number(existingResult.rows[0].id),
      storageKey: buildAssetStorageKey(sha256Hash, resolveStoredImageExtension(mimeType, sourceUrl))
    };
  }

  const extension = resolveStoredImageExtension(mimeType, sourceUrl);
  const storageKey = buildAssetStorageKey(sha256Hash, extension);
  await storage.writeLocalFile(storageKey, content);

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
      VALUES ('local', $1, NULL, $2, $3, $4)
    `,
    [storageKey, sha256Hash, mimeType || inferMimeTypeFromFileName(sourceUrl), content.byteLength]
  );

  return {
    id: Number(insertResult.insertId),
    storageKey
  };
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

function buildAssetStorageKey(sha256Hash: string, extension: string): string {
  return path.posix.join(
    "assets",
    sha256Hash.slice(0, 2),
    sha256Hash.slice(2, 4),
    `${sha256Hash}${extension}`
  );
}

function inferMimeTypeFromFileName(fileNameOrUrl: string): string {
  const extension = path.extname(new URL(fileNameOrUrl, "https://placeholder.local").pathname).toLowerCase();

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

        if (extension) {
          return extension;
        }
      } catch (error) {
        return ".jpg";
      }

      return ".jpg";
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
