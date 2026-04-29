import { readFile } from "node:fs/promises";
import * as path from "node:path";
import { getRequiredDatabaseUrl } from "../config/env";
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

async function main() {
  const pool = createDatabasePool(getRequiredDatabaseUrl());

  try {
    const seedFilePath = path.resolve(process.cwd(), "seeds", "demo-learning-deck.json");
    const seedWords = JSON.parse(await readFile(seedFilePath, "utf8")) as DemoSeedWord[];

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

      await executeQuery(pool, "DELETE FROM word_images WHERE word_id = $1", [word.id]);

      for (const image of word.images) {
        const insertedImageResult = await executeQuery(
          pool,
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
            VALUES ($1, $2, $3, $4, $5, $6, 'active', $7)
          `,
          [
            word.id,
            image.storageType,
            image.storageKey || null,
            image.publicUrl || null,
            image.sourceLabel,
            image.sourceCredit,
            image.sortOrder
          ]
        );

        await executeQuery(
          pool,
          `
            INSERT INTO image_operation_logs (word_image_id, word_id, action, actor_type, note)
            VALUES ($1, $2, 'seed', 'system', 'seeded demo image')
          `,
          [insertedImageResult.insertId, word.id]
        );
      }
    }

    console.log(`Seeded ${seedWords.length} demo words.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
