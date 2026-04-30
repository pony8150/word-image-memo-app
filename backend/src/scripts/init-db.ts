import { readdir, readFile } from "node:fs/promises";
import * as path from "node:path";
import { getRequiredDatabaseUrl } from "../config/env";
import { createDatabasePool, executeQuery } from "../database/mysql";

async function main() {
  const pool = createDatabasePool(getRequiredDatabaseUrl());

  try {
    await waitForDatabase(pool);
    const sqlDirectoryPath = path.resolve(process.cwd(), "sql");
    const sqlFileNames = (await readdir(sqlDirectoryPath))
      .filter((fileName) => /^\d+.*\.sql$/i.test(fileName))
      .sort((left, right) => left.localeCompare(right, "en"));

    for (const sqlFileName of sqlFileNames) {
      const sqlFilePath = path.resolve(sqlDirectoryPath, sqlFileName);
      const sql = await readFile(sqlFilePath, "utf8");
      await executeQuery(pool, sql);
      console.log(`Applied ${sqlFileName}.`);
    }

    console.log("Database schema initialized.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function waitForDatabase(
  pool: ReturnType<typeof createDatabasePool>,
  maxAttempts = 15,
  delayMs = 2000
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await executeQuery(pool, "SELECT 1 AS ok");
      return;
    } catch (error) {
      if (!isRetryableDatabaseError(error) || attempt === maxAttempts) {
        throw error;
      }

      console.log(
        `Database not ready yet (attempt ${attempt}/${maxAttempts}). Waiting ${Math.ceil(delayMs / 1000)}s...`
      );
      await sleep(delayMs);
    }
  }
}

function isRetryableDatabaseError(error: unknown): boolean {
  const errorCode =
    error && typeof error === "object" && "code" in error ? String(error.code) : "";

  return [
    "PROTOCOL_CONNECTION_LOST",
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT",
    "ER_CON_COUNT_ERROR"
  ].includes(errorCode);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
