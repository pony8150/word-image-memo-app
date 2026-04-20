import { readFile } from "node:fs/promises";
import * as path from "node:path";
import { Pool } from "pg";
import { getRequiredDatabaseUrl } from "../config/env";

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
  const pool = new Pool({
    connectionString: getRequiredDatabaseUrl()
  });

  try {
    const seedFilePath = path.resolve(process.cwd(), "seeds", "demo-learning-deck.json");
    const seedWords = JSON.parse(await readFile(seedFilePath, "utf8")) as DemoSeedWord[];

    for (const word of seedWords) {
      await pool.query(
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
          ON CONFLICT (id)
          DO UPDATE SET
            sort_order = EXCLUDED.sort_order,
            english = EXCLUDED.english,
            chinese = EXCLUDED.chinese,
            level = EXCLUDED.level,
            theme = EXCLUDED.theme,
            example_text = EXCLUDED.example_text,
            example_translation = EXCLUDED.example_translation,
            image_reason = EXCLUDED.image_reason,
            scene = EXCLUDED.scene,
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

      await pool.query("DELETE FROM word_images WHERE word_id = $1", [word.id]);

      for (const image of word.images) {
        const insertedImageResult = await pool.query<{ id: string }>(
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
            RETURNING id::text
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

        await pool.query(
          `
            INSERT INTO image_operation_logs (word_image_id, word_id, action, actor_type, note)
            VALUES ($1, $2, 'seed', 'system', 'seeded demo image')
          `,
          [Number(insertedImageResult.rows[0].id), word.id]
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
