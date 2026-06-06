import { readdir, readFile } from "node:fs/promises";
import * as path from "node:path";
import type { Pool } from "mysql2/promise";
import { createDatabasePool, executeQuery } from "./mysql";

interface EnsureDatabaseSchemaReadyOptions {
  sqlDirectoryPath?: string;
  maxAttempts?: number;
  delayMs?: number;
  log?: (message: string) => void;
}

export async function ensureDatabaseSchemaReady(
  databaseUrl: string,
  options: EnsureDatabaseSchemaReadyOptions = {}
): Promise<string[]> {
  const pool = createDatabasePool(databaseUrl);

  try {
    return await applyDatabaseSchema(pool, options);
  } finally {
    await pool.end();
  }
}

export async function applyDatabaseSchema(
  pool: Pool,
  options: EnsureDatabaseSchemaReadyOptions = {}
): Promise<string[]> {
  const sqlDirectoryPath = options.sqlDirectoryPath || resolveDefaultSqlDirectoryPath();
  const sqlFileNames = await listSchemaSqlFiles(sqlDirectoryPath);

  await waitForDatabase(pool, options.maxAttempts, options.delayMs);

  for (const sqlFileName of sqlFileNames) {
    const sqlFilePath = path.resolve(sqlDirectoryPath, sqlFileName);
    const sql = await readFile(sqlFilePath, "utf8");
    await executeQuery(pool, sql);
    options.log?.(`Applied ${sqlFileName}.`);
  }

  return sqlFileNames;
}

export function resolveDefaultSqlDirectoryPath(): string {
  return path.resolve(process.cwd(), "sql");
}

async function listSchemaSqlFiles(sqlDirectoryPath: string): Promise<string[]> {
  return (await readdir(sqlDirectoryPath))
    .filter((fileName) => /^\d+.*\.sql$/i.test(fileName))
    .sort((left, right) => left.localeCompare(right, "en"));
}

async function waitForDatabase(
  pool: Pool,
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
