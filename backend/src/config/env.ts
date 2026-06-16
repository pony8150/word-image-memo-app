import { existsSync, readFileSync } from "node:fs";
import * as path from "node:path";
import { APP_BRAND_NAME } from "./branding";

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
const openAiReasoningEffort = normalizeOpenAiReasoningEffort(
  process.env.OPENAI_REASONING_EFFORT
);

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
  smtpFromName: process.env.SMTP_FROM_NAME || APP_BRAND_NAME,
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiBaseUrl: (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, ""),
  openAiModel: process.env.OPENAI_MODEL || "",
  openAiReasoningEffort
};

export function getRequiredDatabaseUrl(): string {
  if (!appEnv.databaseUrl) {
    throw new Error("Missing DATABASE_URL. Copy backend/.env.example to backend/.env and fill it in.");
  }

  return appEnv.databaseUrl;
}

export function getRequiredOpenAiApiKey(): string {
  if (!appEnv.openAiApiKey) {
    throw new Error("Missing OPENAI_API_KEY. Copy backend/.env.example to backend/.env and fill it in.");
  }

  return appEnv.openAiApiKey;
}

export function getRequiredOpenAiModel(): string {
  if (!appEnv.openAiModel) {
    throw new Error("Missing OPENAI_MODEL. Set the model you want to use in backend/.env.");
  }

  return appEnv.openAiModel;
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

function normalizeOpenAiReasoningEffort(
  value: string | undefined
): "low" | "medium" | "high" {
  switch (String(value || "").trim().toLowerCase()) {
    case "medium":
      return "medium";
    case "high":
      return "high";
    default:
      return "low";
  }
}
