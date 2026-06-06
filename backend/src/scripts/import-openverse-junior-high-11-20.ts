import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { promisify } from "node:util";
import { getRequiredDatabaseUrl } from "../config/env";
import { createDatabasePool, executeQuery } from "../database/mysql";
import { StorageService } from "../storage/storage.service";

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

interface CuratedOpenverseImage {
  mediaUrl: string;
  landingUrl: string;
  sourceName: string;
  creator: string | null;
  license: string;
  title: string;
}

const execFileAsync = promisify(execFile);

const BOOK_CODE = "junior-high";
const TARGET_WORD_LIMIT = 10;
const TARGET_WORD_OFFSET = 10;
const REMOTE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const HTML_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";

const CURATED_OPENVERSE_IMAGES: Record<string, CuratedOpenverseImage> = {
  tuesday: {
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/Wikimania_Nairobi_calendar_illustration.png",
    landingUrl: "https://commons.wikimedia.org/w/index.php?curid=168116878",
    sourceName: "wikimedia",
    creator: "Francis Akuka for the Wikimedia Foundation.",
    license: "CC0",
    title: "Wikimania Nairobi calendar illustration"
  },
  cancel: {
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Cancel_icon.svg",
    landingUrl: "https://commons.wikimedia.org/w/index.php?curid=65581200",
    sourceName: "wikimedia",
    creator: "J.s.ross",
    license: "CC0",
    title: "Cancel icon"
  },
  map: {
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Map-icon.svg",
    landingUrl: "https://commons.wikimedia.org/w/index.php?curid=22534462",
    sourceName: "wikimedia",
    creator: "Loginname",
    license: "CC BY-SA",
    title: "Map-icon"
  },
  grandparent: {
    mediaUrl:
      "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL2pvYjk2Mi0xNjMteC5qcGc.jpg",
    landingUrl: "https://www.rawpixel.com/image/9069720/image-cartoon-illustrations-public-domain",
    sourceName: "rawpixel",
    creator: null,
    license: "CC0",
    title: "Old couple illustration"
  },
  moon: {
    mediaUrl: "https://live.staticflickr.com/7026/6803749855_db7a74cca5_b.jpg",
    landingUrl: "https://www.flickr.com/photos/54060879@N02/6803749855",
    sourceName: "flickr",
    creator: "JanetR3",
    license: "CC BY 2.0",
    title: "The Moon tonight"
  },
  be: {
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/2/25/Arabesque-letter-b-icon.png",
    landingUrl: "https://commons.wikimedia.org/w/index.php?curid=47507301",
    sourceName: "wikimedia",
    creator: "Iconarchive",
    license: "CC BY",
    title: "Arabesque-letter-b-icon"
  },
  america: {
    mediaUrl: "https://live.staticflickr.com/5014/13989104603_a0f5c13fe6_b.jpg",
    landingUrl: "https://www.flickr.com/photos/24662369@N07/13989104603",
    sourceName: "nasa",
    creator: "NASA Goddard Photo and Video",
    license: "CC BY",
    title: "Satellite View of the Americas on Earth Day"
  },
  need: {
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/5/56/Help_icon_%28the_Noun_Project_38716%29_blue.svg",
    landingUrl: "https://commons.wikimedia.org/w/index.php?curid=161638022",
    sourceName: "wikimedia",
    creator: "Pieter J. Smits",
    license: "CC BY",
    title: "Help icon (the Noun Project 38716) blue"
  },
  new: {
    mediaUrl: "https://live.staticflickr.com/2459/3557632341_56385e7540.jpg",
    landingUrl: "https://www.flickr.com/photos/17416832@N00/3557632341",
    sourceName: "flickr",
    creator: "emmajanehw",
    license: "CC BY",
    title: "New labels"
  },
  stamp: {
    mediaUrl: "https://live.staticflickr.com/2431/3894658446_d1b6169c49_b.jpg",
    landingUrl: "https://www.flickr.com/photos/49879584@N00/3894658446",
    sourceName: "flickr",
    creator: "Double--M",
    license: "CC BY",
    title: "Ottoman Empire postage stamp"
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
      throw new Error(`No words found for book "${BOOK_CODE}" offset ${TARGET_WORD_OFFSET}.`);
    }

    for (const word of targetWords) {
      const existingDefaultCount = await getExistingDefaultImageCount(pool, word.id);

      if (existingDefaultCount > 0) {
        skippedCount += 1;
        console.log(`Skipping ${word.id}: already has ${existingDefaultCount} active default image(s).`);
        continue;
      }

      const curatedImage = CURATED_OPENVERSE_IMAGES[word.id];

      if (!curatedImage) {
        throw new Error(`Missing curated Openverse image for "${word.id}".`);
      }

      console.log(`Downloading curated Openverse image for ${word.id}...`);

      const downloadedImage = await downloadImage(curatedImage.mediaUrl);
      const asset = await resolveOrCreateLocalAsset(
        storage,
        pool,
        downloadedImage.content,
        downloadedImage.mimeType,
        curatedImage.mediaUrl
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
          VALUES ($1, $2, 'default', NULL, 'Openverse', $3, 'active', 0)
        `,
        [word.id, asset.id, buildSourceCredit(curatedImage)]
      );

      await executeQuery(
        pool,
        `
          INSERT INTO image_operation_logs (word_image_id, word_id, action, actor_type, note)
          VALUES ($1, $2, 'seed', 'system', 'imported from curated Openverse result')
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
      LIMIT ${TARGET_WORD_LIMIT} OFFSET ${TARGET_WORD_OFFSET}
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

async function downloadImage(
  imageUrl: string
): Promise<{ content: Buffer; mimeType: string }> {
  const tempDirectoryPath = await mkdtemp(path.join(tmpdir(), "openverse-import-"));
  const tempFilePath = path.join(tempDirectoryPath, "asset.bin");

  try {
    await execFileAsync(
      "curl.exe",
      [
        "-L",
        "--fail",
        "--silent",
        "--show-error",
        "--retry",
        "3",
        "--retry-all-errors",
        "--retry-delay",
        "1",
        "-A",
        HTML_USER_AGENT,
        "-H",
        "Accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "-o",
        tempFilePath,
        imageUrl
      ],
      {
        timeout: 30000,
        maxBuffer: 1024 * 1024
      }
    );

    const content = await readFile(tempFilePath);

    if (content.byteLength > REMOTE_IMAGE_MAX_BYTES) {
      throw new Error(`Image ${imageUrl} exceeded ${REMOTE_IMAGE_MAX_BYTES} bytes after download.`);
    }

    return {
      content,
      mimeType: detectMimeType(content, imageUrl)
    };
  } finally {
    await rm(tempDirectoryPath, { recursive: true, force: true });
  }
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

function buildSourceCredit(image: CuratedOpenverseImage): string {
  const creator = image.creator?.trim() || "unknown creator";
  return `${image.title} | ${image.sourceName} | ${creator} | ${image.license} | ${image.landingUrl}`;
}

function buildAssetStorageKey(sha256Hash: string, extension: string): string {
  return path.posix.join(
    "assets",
    sha256Hash.slice(0, 2),
    sha256Hash.slice(2, 4),
    `${sha256Hash}${extension}`
  );
}

function detectMimeType(content: Buffer, sourceUrl: string): string {
  if (content.byteLength >= 12) {
    if (
      content[0] === 0x89 &&
      content[1] === 0x50 &&
      content[2] === 0x4e &&
      content[3] === 0x47
    ) {
      return "image/png";
    }

    if (content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff) {
      return "image/jpeg";
    }

    if (
      content[0] === 0x47 &&
      content[1] === 0x49 &&
      content[2] === 0x46 &&
      content[3] === 0x38
    ) {
      return "image/gif";
    }

    if (
      content[0] === 0x52 &&
      content[1] === 0x49 &&
      content[2] === 0x46 &&
      content[3] === 0x46 &&
      content[8] === 0x57 &&
      content[9] === 0x45 &&
      content[10] === 0x42 &&
      content[11] === 0x50
    ) {
      return "image/webp";
    }
  }

  const prefixText = content.slice(0, 256).toString("utf8").trimStart().toLowerCase();

  if (prefixText.startsWith("<?xml") || prefixText.startsWith("<svg")) {
    return "image/svg+xml";
  }

  return inferMimeTypeFromFileName(sourceUrl);
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
