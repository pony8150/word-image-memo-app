import { existsSync, readFileSync } from "node:fs";
import * as path from "node:path";

loadEnvFile(path.resolve(process.cwd(), ".env"));

function toNumber(value: string | undefined, fallback: number): number {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

const port = toNumber(process.env.PORT, 3000);
const uploadsDirName = process.env.UPLOADS_DIR || "uploads";

export const appEnv = {
  port,
  publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://localhost:${port}`,
  databaseUrl: process.env.DATABASE_URL || "",
  uploadsDir: path.resolve(process.cwd(), uploadsDirName),
  imagePurgeRetentionHours: toNumber(process.env.IMAGE_PURGE_RETENTION_HOURS, 24)
};

export function getRequiredDatabaseUrl(): string {
  if (!appEnv.databaseUrl) {
    throw new Error("Missing DATABASE_URL. Copy backend/.env.example to backend/.env and fill it in.");
  }

  return appEnv.databaseUrl;
}

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) {
    return;
  }

  const fileContent = readFileSync(filePath, "utf8");

  fileContent.split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex <= 0) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();

    if (!key || process.env[key] !== undefined) {
      return;
    }

    process.env[key] = stripWrappingQuotes(rawValue);
  });
}

function stripWrappingQuotes(value: string): string {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
