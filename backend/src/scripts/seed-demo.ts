import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import * as path from "node:path";
import { appEnv, getRequiredDatabaseUrl } from "../config/env";
import { createDatabasePool, executeQuery } from "../database/mysql";

interface DemoSeedImage {
  sortOrder: number;
  storageType: "external" | "local" | "oss";
  storageKey?: string | null;
  publicUrl?: string | null;
  sourceLabel: string;
  sourceCredit: string | null;
}

interface DemoSeedWord {
  sortOrder: number;
  id: string;
  english: string;
  chinese: string;
  level: string | null;
  theme: string | null;
  example: string | null;
  exampleChinese: string | null;
  imageReason: string | null;
  scene: string | null;
  images: DemoSeedImage[];
}

interface DemoBookDefinition {
  code: string;
  name: string;
  sortOrder: number;
  wordIds: string[];
}

const DEMO_BOOKS: DemoBookDefinition[] = [
  {
    code: "junior-high",
    name: "初中词书",
    sortOrder: 1,
    wordIds: ["apple", "bicycle", "library", "bridge", "forest", "puzzle"]
  },
  {
    code: "senior-high",
    name: "高中词书",
    sortOrder: 2,
    wordIds: ["library", "forest", "courage", "whisper", "journey", "harvest"]
  },
  {
    code: "college",
    name: "大学词书",
    sortOrder: 3,
    wordIds: ["library", "courage", "whisper", "puzzle", "journey", "harvest"]
  }
];

async function main() {
  const pool = createDatabasePool(getRequiredDatabaseUrl());

  try {
    const seedFilePath = path.resolve(process.cwd(), "seeds", "demo-learning-deck.json");
    const seedWords = JSON.parse(await readFile(seedFilePath, "utf8")) as DemoSeedWord[];
    const bookIdsByCode = await ensureBooks(pool);

    for (const word of seedWords) {
      await executeQuery(
        pool,
        `
          INSERT INTO words (
            id,
            sort_order,
            english,
            chinese,
            level,
            theme,
            example_text,
            example_translation,
            image_reason,
            scene
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON DUPLICATE KEY UPDATE
            sort_order = VALUES(sort_order),
            english = VALUES(english),
            chinese = VALUES(chinese),
            level = VALUES(level),
            theme = VALUES(theme),
            example_text = VALUES(example_text),
            example_translation = VALUES(example_translation),
            image_reason = VALUES(image_reason),
            scene = VALUES(scene),
            updated_at = NOW()
        `,
        [
          word.id,
          word.sortOrder,
          word.english,
          word.chinese,
          word.level,
          word.theme,
          word.example,
          word.exampleChinese,
          word.imageReason,
          word.scene
        ]
      );

      await executeQuery(pool, "DELETE FROM book_words WHERE word_id = $1", [word.id]);

      const relatedBooks = DEMO_BOOKS.filter((book) => book.wordIds.includes(word.id));

      for (const book of relatedBooks) {
        await executeQuery(
          pool,
          `
            INSERT INTO book_words (
              book_id,
              word_id,
              sort_order
            )
            VALUES ($1, $2, $3)
            ON DUPLICATE KEY UPDATE
              sort_order = VALUES(sort_order)
          `,
          [bookIdsByCode.get(book.code), word.id, word.sortOrder]
        );
      }

      await executeQuery(
        pool,
        `
          DELETE FROM word_images
          WHERE word_id = $1
            AND scope = 'default'
        `,
        [word.id]
      );

      for (const image of word.images) {
        let assetId: number;

        try {
          assetId = await ensureImageAsset(pool, image);
        } catch (error) {
          if (isMissingFileError(error)) {
            console.warn(
              `Skipping missing demo image for word "${word.id}": ${image.storageKey || image.publicUrl || "unknown source"}`
            );
            continue;
          }

          throw error;
        }

        const insertedImageResult = await executeQuery(
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
          [word.id, assetId, image.sourceLabel, image.sourceCredit, image.sortOrder]
        );

        await executeQuery(
          pool,
          `
            INSERT INTO image_operation_logs (word_image_id, word_id, action, actor_type, note)
            VALUES ($1, $2, 'seed', 'system', 'seeded default image')
          `,
          [insertedImageResult.insertId, word.id]
        );
      }
    }

    console.log(`Seeded ${seedWords.length} demo words across ${DEMO_BOOKS.length} books.`);
  } finally {
    await pool.end();
  }
}

async function ensureBooks(
  pool: ReturnType<typeof createDatabasePool>
): Promise<Map<string, number>> {
  const bookIdsByCode = new Map<string, number>();

  for (const book of DEMO_BOOKS) {
    await executeQuery(
      pool,
      `
        INSERT INTO books (
          code,
          name,
          sort_order
        )
        VALUES ($1, $2, $3)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          sort_order = VALUES(sort_order),
          updated_at = NOW()
      `,
      [book.code, book.name, book.sortOrder]
    );

    const bookResult = await executeQuery<{ id: number | string }>(
      pool,
      `
        SELECT id
        FROM books
        WHERE code = $1
        LIMIT 1
      `,
      [book.code]
    );

    bookIdsByCode.set(book.code, Number(bookResult.rows[0].id));
  }

  return bookIdsByCode;
}

async function ensureImageAsset(
  pool: ReturnType<typeof createDatabasePool>,
  image: DemoSeedImage
): Promise<number> {
  if (image.storageType === "local" && image.storageKey) {
    const absoluteFilePath = path.resolve(appEnv.uploadsDir, image.storageKey);
    const content = await readFile(absoluteFilePath);
    const sha256Hash = createHash("sha256").update(content).digest("hex");
    const existingAssetResult = await executeQuery<{ id: number | string }>(
      pool,
      `
        SELECT id
        FROM image_assets
        WHERE sha256_hash = $1
        LIMIT 1
      `,
      [sha256Hash]
    );

    if (existingAssetResult.rows[0]) {
      return Number(existingAssetResult.rows[0].id);
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
        VALUES ('local', $1, NULL, $2, $3, $4)
      `,
      [
        image.storageKey,
        sha256Hash,
        inferMimeTypeFromFileName(image.storageKey),
        content.byteLength
      ]
    );

    return Number(insertResult.insertId);
  }

  if (image.storageType === "external" && image.publicUrl) {
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
      [image.publicUrl]
    );

    return Number(insertResult.insertId);
  }

  throw new Error(`Unsupported demo image asset: ${JSON.stringify(image)}`);
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

function isMissingFileError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      String((error as { code?: unknown }).code) === "ENOENT"
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
