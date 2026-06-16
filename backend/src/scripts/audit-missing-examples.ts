import { getRequiredDatabaseUrl } from "../config/env";
import { createDatabasePool, executeQuery } from "../database/mysql";

interface MissingExampleRow {
  id: string;
  english: string;
  chinese: string;
  level: string | null;
}

interface MissingExampleSummaryRow {
  level: string | null;
  total: number | string;
}

async function main() {
  const pool = createDatabasePool(getRequiredDatabaseUrl());

  try {
    const summaryResult = await executeQuery<MissingExampleSummaryRow>(
      pool,
      `
        SELECT
          COALESCE(level, 'unknown') AS level,
          COUNT(*) AS total
        FROM words
        WHERE example_text IS NULL
           OR TRIM(example_text) = ''
        GROUP BY COALESCE(level, 'unknown')
        ORDER BY total DESC, level ASC
      `
    );

    const sampleResult = await executeQuery<MissingExampleRow>(
      pool,
      `
        SELECT
          id,
          english,
          chinese,
          level
        FROM words
        WHERE example_text IS NULL
           OR TRIM(example_text) = ''
        ORDER BY
          CASE
            WHEN level = 'junior-high' THEN 1
            WHEN level = 'senior-high' THEN 2
            WHEN level = 'postgraduate' THEN 3
            ELSE 9
          END ASC,
          english ASC
        LIMIT 20
      `
    );

    console.log(
      JSON.stringify(
        {
          summary: summaryResult.rows.map((row) => ({
            level: row.level || "unknown",
            total: Number(row.total || 0)
          })),
          sampleMissingWords: sampleResult.rows
        },
        null,
        2
      )
    );
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
