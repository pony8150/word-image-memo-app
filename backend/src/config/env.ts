import { existsSync, readFileSync } from "node:fs";
import * as path from "node:path";

loadEnvFile(path.resolve(process.cwd(), ".env"));

function toNumber(value: string | undefined, fallback: number): number {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function toBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return /^(1|true|yes|on)$/i.test(value);
}

const port = toNumber(process.env.PORT, 3000);
const uploadsDirName = process.env.UPLOADS_DIR || "uploads";
const smtpPort = toNumber(process.env.SMTP_PORT, 465);
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const smtpFromEmail = process.env.SMTP_FROM_EMAIL || smtpUser;

export const appEnv = {
  port,
  publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://localhost:${port}`,
  databaseUrl: process.env.DATABASE_URL || "",
  uploadsDir: path.resolve(process.cwd(), uploadsDirName),
  imagePurgeRetentionHours: toNumber(process.env.IMAGE_PURGE_RETENTION_HOURS, 24),
  authSessionTtlDays: toNumber(process.env.AUTH_SESSION_TTL_DAYS, 30),
  smtpEnabled: Boolean(process.env.SMTP_HOST && smtpUser && smtpPass && smtpFromEmail),
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort,
  smtpSecure: toBoolean(process.env.SMTP_SECURE, smtpPort === 465),
  smtpUser,
  smtpPass,
  smtpFromEmail,
  smtpFromName: process.env.SMTP_FROM_NAME || "Word Image Memo"
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
