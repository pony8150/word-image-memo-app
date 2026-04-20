import { readFile } from "node:fs/promises";
import * as path from "node:path";
import { Pool } from "pg";
import { getRequiredDatabaseUrl } from "../config/env";

async function main() {
  const pool = new Pool({
    connectionString: getRequiredDatabaseUrl()
  });

  try {
    const sqlFilePath = path.resolve(process.cwd(), "sql", "001_init.sql");
    const sql = await readFile(sqlFilePath, "utf8");
    await pool.query(sql);
    console.log("Database schema initialized.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
