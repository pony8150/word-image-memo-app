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

interface ExistingPrivateImageCountRow {
  count: number | string;
}

interface ImageAssetRow {
  id: number | string;
}

interface PersistedAsset {
  id: number;
  storageKey: string;
}

interface ActiveUserRow {
  user_id: number | string;
  email: string;
  display_name: string | null;
}

interface CuratedPexelsImage {
  referenceUrl: string;
  sourceUrl: string;
  title: string;
}

const BOOK_CODE = "junior-high";
const TARGET_WORD_LIMIT = 10;
const TARGET_WORD_OFFSET = 10;
const PRIVATE_SOURCE_LABEL = "Pexels";

const CURATED_PEXELS_IMAGES: Record<string, CuratedPexelsImage> = {
  tuesday: {
    referenceUrl: "https://images.pexels.com/photos/7428211/pexels-photo-7428211.jpeg",
    sourceUrl: "https://www.pexels.com/search/tuesday/",
    title: "Tuesday planner"
  },
  cancel: {
    referenceUrl: "https://images.pexels.com/photos/4004291/pexels-photo-4004291.jpeg",
    sourceUrl: "https://www.pexels.com/search/cancel/",
    title: "Everything is canceled sign"
  },
  map: {
    referenceUrl: "https://images.pexels.com/photos/7634479/pexels-photo-7634479.jpeg",
    sourceUrl: "https://www.pexels.com/search/map/",
    title: "Folded paper map"
  },
  grandparent: {
    referenceUrl: "https://www.pexels.com/photo/elderly-couple-1653898/",
    sourceUrl: "https://www.pexels.com/photo/elderly-couple-1653898/",
    title: "Elderly couple"
  },
  moon: {
    referenceUrl: "https://images.pexels.com/photos/30284245/pexels-photo-30284245.jpeg",
    sourceUrl: "https://www.pexels.com/search/moon/",
    title: "Moon in black sky"
  },
  be: {
    referenceUrl: "https://images.pexels.com/photos/8154070/pexels-photo-8154070.jpeg",
    sourceUrl: "https://www.pexels.com/search/letter%20b/",
    title: "Let It Be tiles"
  },
  america: {
    referenceUrl: "https://images.pexels.com/photos/16135529/pexels-photo-16135529.jpeg",
    sourceUrl: "https://www.pexels.com/search/america/",
    title: "Golden Gate Bridge"
  },
  need: {
    referenceUrl: "https://images.pexels.com/photos/7640817/pexels-photo-7640817.jpeg",
    sourceUrl: "https://www.pexels.com/search/help/",
    title: "Office help sign"
  },
  new: {
    referenceUrl: "https://images.pexels.com/photos/12279148/pexels-photo-12279148.jpeg",
    sourceUrl: "https://www.pexels.com/search/new%20shoes/",
    title: "White sneakers in box"
  },
  stamp: {
    referenceUrl: "https://images.pexels.com/photos/7462696/pexels-photo-7462696.jpeg",
    sourceUrl: "https://www.pexels.com/search/postage%20stamp/",
    title: "Red postage stamp"
  }
};

async function main() {
  const pool = createDatabasePool(getRequiredDatabaseUrl());
  const storage = new StorageService();
  await storage.onModuleInit();

  let importedCount = 0;
  let skippedCount = 0;

  try {
    const activeUser = await resolveMostRecentActiveUser(pool);
    console.log(`Target user: ${activeUser.email} (id=${activeUser.user_id})`);

    const targetWords = await listTargetWords(pool);

    if (targetWords.length === 0) {
      throw new Error(`No words found for book "${BOOK_CODE}" offset ${TARGET_WORD_OFFSET}.`);
    }

    for (const word of targetWords) {
      const existingPrivateCount = await getExistingPrivateImageCount(
        pool,
        word.id,
        Number(activeUser.user_id)
      );

      if (existingPrivateCount > 0) {
        skippedCount += 1;
        console.log(
          `Skipping ${word.id}: user already has ${existingPrivateCount} active "${PRIVATE_SOURCE_LABEL}" private image(s).`
        );
        continue;
      }

      const curatedImage = CURATED_PEXELS_IMAGES[word.id];

      if (!curatedImage) {
        throw new Error(`Missing curated Pexels image for "${word.id}".`);
      }

      console.log(`Downloading curated Pexels image for ${word.id}...`);

      const downloadedImage = await downloadPexelsImageWithinLimit(curatedImage.referenceUrl);
      const asset = await resolveOrCreateLocalAsset(
        storage,
        pool,
        downloadedImage.content,
        downloadedImage.mimeType,
        downloadedImage.optimizedUrl
      );

      const nextSortOrder = await getNextPrivateSortOrder(pool, word.id, Number(activeUser.user_id));

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
            sort_order,
            created_by_user_id
          )
          VALUES ($1, $2, 'private', $3, $4, $5, 'active', $6, $3)
        `,
        [
          word.id,
          asset.id,
          Number(activeUser.user_id),
          PRIVATE_SOURCE_LABEL,
          buildSourceCredit(curatedImage),
          nextSortOrder
        ]
      );

      await executeQuery(
        pool,
        `
          INSERT INTO image_operation_logs (word_image_id, word_id, action, actor_type, note)
          VALUES ($1, $2, 'seed', 'system', 'imported curated Pexels image as private user image')
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

async function resolveMostRecentActiveUser(
  pool: ReturnType<typeof createDatabasePool>
): Promise<ActiveUserRow> {
  const result = await executeQuery<ActiveUserRow>(
    pool,
    `
      SELECT
        CAST(u.id AS CHAR) AS user_id,
        u.email,
        u.display_name
      FROM user_sessions us
      INNER JOIN users u
        ON u.id = us.user_id
      WHERE us.expires_at > NOW()
      ORDER BY us.last_used_at DESC, us.created_at DESC, us.id DESC
      LIMIT 1
    `
  );

  if (!result.rows[0]) {
    throw new Error("Could not find an active user session to attach private images to.");
  }

  return result.rows[0];
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
      LIMIT ${TARGET_WORD_LIMIT} OFFSET ${TARGET_WORD_OFFSET}
    `,
    [BOOK_CODE]
  );

  return result.rows;
}

async function getExistingPrivateImageCount(
  pool: ReturnType<typeof createDatabasePool>,
  wordId: string,
  userId: number
): Promise<number> {
  const result = await executeQuery<ExistingPrivateImageCountRow>(
    pool,
    `
      SELECT COUNT(*) AS count
      FROM word_images
      WHERE word_id = $1
        AND scope = 'private'
        AND owner_user_id = $2
        AND status = 'active'
        AND source_label = $3
    `,
    [wordId, userId, PRIVATE_SOURCE_LABEL]
  );

  return Number(result.rows[0]?.count || 0);
}

async function getNextPrivateSortOrder(
  pool: ReturnType<typeof createDatabasePool>,
  wordId: string,
  userId: number
): Promise<number> {
  const result = await executeQuery<{ next_sort_order: number | string }>(
    pool,
    `
      SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order
      FROM word_images
      WHERE word_id = $1
        AND scope = 'private'
        AND owner_user_id = $2
        AND status = 'active'
    `,
    [wordId, userId]
  );

  return Number(result.rows[0]?.next_sort_order || 1);
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

function buildSourceCredit(image: CuratedPexelsImage): string {
  return `${image.title} | ${image.sourceUrl}`;
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
