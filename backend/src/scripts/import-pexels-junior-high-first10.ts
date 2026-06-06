import { createHash } from "node:crypto";
import * as path from "node:path";
import { getRequiredDatabaseUrl } from "../config/env";
import { createDatabasePool, executeQuery } from "../database/mysql";
import { StorageService } from "../storage/storage.service";
import { downloadPexelsImageWithinLimit } from "./pexels-download";

interface TargetWordRow {
  sort_order: number | string;
  id: string;
  english: string;
  chinese: string;
}

interface ExistingImageCountRow {
  count: number | string;
}

interface ImageAssetRow {
  id: number | string;
}

interface PersistedAsset {
  id: number;
  storageKey: string;
}

interface CuratedPexelsPhoto {
  pageUrl: string;
}

const BOOK_CODE = "junior-high";
const TARGET_WORD_LIMIT = 10;
const REMOTE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const CURATED_PEXELS_PHOTOS: Record<string, CuratedPexelsPhoto> = {
  boat: {
    pageUrl: "https://www.pexels.com/photo/a-small-boat-is-sitting-in-the-water-27537389/"
  },
  group: {
    pageUrl: "https://www.pexels.com/photo/group-of-friends-17355574/"
  },
  nineteen: {
    pageUrl: "https://www.pexels.com/photo/young-woman-holding-balloons-with-number-19-16235167/"
  },
  party: {
    pageUrl: "https://www.pexels.com/photo/people-celebrating-a-birthday-party-7810979/"
  },
  marriage: {
    pageUrl: "https://www.pexels.com/photo/wedding-couple-1587042/"
  },
  clean: {
    pageUrl: "https://www.pexels.com/photo/a-clean-room-10588590/"
  },
  bottle: {
    pageUrl: "https://www.pexels.com/photo/bottle-with-water-14946509/"
  },
  tail: {
    pageUrl: "https://www.pexels.com/photo/dog-s-tail-3299902/"
  },
  very: {
    pageUrl: "https://www.pexels.com/photo/a-smiling-woman-looking-very-excited-6250961/"
  },
  bag: {
    pageUrl: "https://www.pexels.com/photo/a-student-holding-a-backpack-13198544/"
  }
};

async function main() {
  const pool = createDatabasePool(getRequiredDatabaseUrl());
  const storage = new StorageService();
  await storage.onModuleInit();

  let importedCount = 0;
  let skippedCount = 0;

  try {
    const targetWords = await listTargetWords(pool);

    if (targetWords.length === 0) {
      throw new Error(`No words found for book "${BOOK_CODE}".`);
    }

    for (const word of targetWords) {
      const existingDefaultCount = await getExistingDefaultImageCount(pool, word.id);

      if (existingDefaultCount > 0) {
        skippedCount += 1;
        console.log(`Skipping ${word.id}: already has ${existingDefaultCount} active default image(s).`);
        continue;
      }

      const curatedPhoto = CURATED_PEXELS_PHOTOS[word.id];

      if (!curatedPhoto) {
        throw new Error(`Missing curated Pexels page for "${word.id}".`);
      }

      console.log(`Resolving curated Pexels photo for ${word.id}...`);

      const downloadedImage = await downloadPexelsImageWithinLimit(curatedPhoto.pageUrl);
      const asset = await resolveOrCreateLocalAsset(
        storage,
        pool,
        downloadedImage.content,
        downloadedImage.mimeType,
        downloadedImage.optimizedUrl
      );

      const insertedImage = await executeQuery(
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
          VALUES ($1, $2, 'default', NULL, 'Pexels', $3, 'active', 0)
        `,
        [word.id, asset.id, curatedPhoto.pageUrl]
      );

      await executeQuery(
        pool,
        `
          INSERT INTO image_operation_logs (word_image_id, word_id, action, actor_type, note)
          VALUES ($1, $2, 'seed', 'system', 'imported from curated Pexels photo page')
        `,
        [insertedImage.insertId, word.id]
      );

      importedCount += 1;
      console.log(`Imported ${word.id} -> ${asset.storageKey}`);
    }

    console.log(`Finished. Imported ${importedCount} image(s), skipped ${skippedCount}.`);
  } finally {
    await pool.end();
  }
}

async function listTargetWords(
  pool: ReturnType<typeof createDatabasePool>
): Promise<TargetWordRow[]> {
  const result = await executeQuery<TargetWordRow>(
    pool,
    `
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
      LIMIT ${TARGET_WORD_LIMIT}
    `,
    [BOOK_CODE]
  );

  return result.rows;
}

async function getExistingDefaultImageCount(
  pool: ReturnType<typeof createDatabasePool>,
  wordId: string
): Promise<number> {
  const result = await executeQuery<ExistingImageCountRow>(
    pool,
    `
      SELECT COUNT(*) AS count
      FROM word_images
      WHERE word_id = $1
        AND scope = 'default'
        AND status = 'active'
    `,
    [wordId]
  );

  return Number(result.rows[0]?.count || 0);
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

function normalizeMimeType(value: string | null): string {
  return value?.split(";")[0]?.trim().toLowerCase() || "image/jpeg";
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
