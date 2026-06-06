import { getRequiredDatabaseUrl } from "../config/env";
import { ensureDatabaseSchemaReady } from "../database/schema";

async function main() {
  await ensureDatabaseSchemaReady(getRequiredDatabaseUrl(), {
    log: (message) => console.log(message)
  });
  console.log("Database schema initialized.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
