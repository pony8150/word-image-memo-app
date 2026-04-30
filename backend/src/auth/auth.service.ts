import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import * as nodemailer from "nodemailer";
import { appEnv } from "../config/env";
import { DatabaseService } from "../database/database.service";
import type { DatabaseClient } from "../database/mysql";

interface UserRow {
  id: number | string;
  email: string;
  display_name: string;
  password_hash: string | null;
}

interface SessionUserRow extends UserRow {
  expires_at: Date | string;
}

interface VerificationCodeRow {
  id: number | string;
  code_hash: string;
  expires_at: Date | string;
  consumed_at: Date | string | null;
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  displayName: string;
}

const REGISTER_CODE_COOLDOWN_SECONDS = 60;
const REGISTER_CODE_TTL_MINUTES = 10;
const MIN_PASSWORD_LENGTH = 6;
const PASSWORD_HASH_PREFIX = "scrypt";

@Injectable()
export class AuthService {
  private mailTransporter =
    appEnv.smtpEnabled
      ? nodemailer.createTransport({
          host: appEnv.smtpHost,
          port: appEnv.smtpPort,
          secure: appEnv.smtpSecure,
          auth: {
            user: appEnv.smtpUser,
            pass: appEnv.smtpPass
          }
        })
      : null;

  constructor(private readonly database: DatabaseService) {}

  async sendRegisterCode(email: string) {
    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      throw new BadRequestException("Please enter a valid email address.");
    }

    const recentCodeResult = await this.database.query<{ created_at: Date | string }>(
      `
        SELECT created_at
        FROM email_verification_codes
        WHERE email = $1
          AND purpose = 'register'
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [normalizedEmail]
    );

    const latestCreatedAt = recentCodeResult.rows[0]?.created_at;

    if (latestCreatedAt) {
      const secondsSinceLastSend = Math.floor(
        (Date.now() - new Date(latestCreatedAt).getTime()) / 1000
      );

      if (secondsSinceLastSend < REGISTER_CODE_COOLDOWN_SECONDS) {
        throw new ConflictException(
          `Please wait ${REGISTER_CODE_COOLDOWN_SECONDS - secondsSinceLastSend}s before requesting another code.`
        );
      }
    }

    const verificationCode = generateVerificationCode();
    const codeHash = hashVerificationCode(normalizedEmail, verificationCode);
    const expiresAt = new Date(Date.now() + REGISTER_CODE_TTL_MINUTES * 60 * 1000);

    await this.database.query(
      `
        INSERT INTO email_verification_codes (
          email,
          purpose,
          code_hash,
          expires_at,
          consumed_at
        )
        VALUES ($1, 'register', $2, $3, NULL)
      `,
      [normalizedEmail, codeHash, expiresAt]
    );

    if (this.mailTransporter) {
      await this.mailTransporter.sendMail({
        from: formatFromAddress(),
        to: normalizedEmail,
        subject: "Your Word Image Memo verification code",
        text: `Your verification code is ${verificationCode}. It will expire in ${REGISTER_CODE_TTL_MINUTES} minutes.`
      });
    }

    return {
      sentTo: normalizedEmail,
      cooldownSeconds: REGISTER_CODE_COOLDOWN_SECONDS,
      devCode: this.mailTransporter ? undefined : verificationCode
    };
  }

  async registerWithEmail(
    email: string,
    password: string,
    verificationCode: string,
    userAgent?: string,
    forwardedFor?: string
  ) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = String(password || "");
    const normalizedCode = String(verificationCode || "").trim();

    if (!isValidEmail(normalizedEmail)) {
      throw new BadRequestException("Please enter a valid email address.");
    }

    if (normalizedPassword.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      throw new BadRequestException("Verification code must be 6 digits.");
    }

    return this.database.transaction(async (client) => {
      const existingUser = await this.findUserByEmail(normalizedEmail, client);

      if (existingUser) {
        throw new ConflictException("This email address is already registered.");
      }

      const codeRow = await this.findLatestRegisterCode(normalizedEmail, client);

      if (!codeRow || codeRow.consumed_at) {
        throw new BadRequestException("Verification code is missing or already used.");
      }

      if (new Date(codeRow.expires_at).getTime() < Date.now()) {
        throw new BadRequestException("Verification code has expired.");
      }

      if (codeRow.code_hash !== hashVerificationCode(normalizedEmail, normalizedCode)) {
        throw new BadRequestException("Verification code is incorrect.");
      }

      const passwordHash = hashPassword(normalizedPassword);
      const displayName = buildDefaultDisplayName(normalizedEmail);
      const insertUserResult = await client.query(
        `
          INSERT INTO users (
            email,
            display_name,
            password_hash,
            auth_provider,
            email_verified,
            last_login_at
          )
          VALUES ($1, $2, $3, 'email', TRUE, NOW())
        `,
        [normalizedEmail, displayName, passwordHash]
      );
      const userId = Number(insertUserResult.insertId);

      await client.query(
        `
          UPDATE email_verification_codes
          SET consumed_at = NOW()
          WHERE id = $1
        `,
        [Number(codeRow.id)]
      );

      const authPayload = await this.createSessionForUser(
        client,
        {
          id: userId,
          email: normalizedEmail,
          display_name: displayName,
          password_hash: passwordHash
        },
        userAgent,
        forwardedFor
      );

      return authPayload;
    });
  }

  async loginWithEmail(email: string, password: string, userAgent?: string, forwardedFor?: string) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = String(password || "");

    if (!isValidEmail(normalizedEmail)) {
      throw new BadRequestException("Please enter a valid email address.");
    }

    const user = await this.findUserByEmail(normalizedEmail);

    if (!user?.password_hash || !verifyPassword(normalizedPassword, user.password_hash)) {
      throw new UnauthorizedException("Email or password is incorrect.");
    }

    return this.database.transaction(async (client) => {
      await client.query(
        `
          UPDATE users
          SET last_login_at = NOW()
          WHERE id = $1
        `,
        [Number(user.id)]
      );

      return this.createSessionForUser(client, user, userAgent, forwardedFor);
    });
  }

  async requireUserFromAuthorization(authorization?: string): Promise<AuthenticatedUser> {
    const sessionToken = parseBearerToken(authorization);

    if (!sessionToken) {
      throw new UnauthorizedException("Please sign in first.");
    }

    const tokenHash = hashSessionToken(sessionToken);
    const sessionResult = await this.database.query<SessionUserRow>(
      `
        SELECT
          u.id,
          u.email,
          u.display_name,
          u.password_hash,
          s.expires_at
        FROM user_sessions s
        INNER JOIN users u
          ON u.id = s.user_id
        WHERE s.session_token_hash = $1
        LIMIT 1
      `,
      [tokenHash]
    );

    const sessionUser = sessionResult.rows[0];

    if (!sessionUser) {
      throw new UnauthorizedException("Session is invalid. Please sign in again.");
    }

    if (new Date(sessionUser.expires_at).getTime() <= Date.now()) {
      await this.database.query(
        `
          DELETE FROM user_sessions
          WHERE session_token_hash = $1
        `,
        [tokenHash]
      );
      throw new UnauthorizedException("Session has expired. Please sign in again.");
    }

    await this.database.query(
      `
        UPDATE user_sessions
        SET last_used_at = NOW()
        WHERE session_token_hash = $1
      `,
      [tokenHash]
    );

    return {
      id: Number(sessionUser.id),
      email: sessionUser.email,
      displayName: sessionUser.display_name
    };
  }

  async logout(authorization?: string): Promise<void> {
    const sessionToken = parseBearerToken(authorization);

    if (!sessionToken) {
      return;
    }

    await this.database.query(
      `
        DELETE FROM user_sessions
        WHERE session_token_hash = $1
      `,
      [hashSessionToken(sessionToken)]
    );
  }

  private async findUserByEmail(
    email: string,
    client?: DatabaseClient
  ): Promise<UserRow | null> {
    const result = client
      ? await client.query<UserRow>(
          `
            SELECT id, email, display_name, password_hash
            FROM users
            WHERE email = $1
            LIMIT 1
          `,
          [email]
        )
      : await this.database.query<UserRow>(
          `
            SELECT id, email, display_name, password_hash
            FROM users
            WHERE email = $1
            LIMIT 1
          `,
          [email]
        );

    return result.rows[0] || null;
  }

  private async findLatestRegisterCode(
    email: string,
    client?: DatabaseClient
  ): Promise<VerificationCodeRow | null> {
    const result = client
      ? await client.query<VerificationCodeRow>(
          `
            SELECT id, code_hash, expires_at, consumed_at
            FROM email_verification_codes
            WHERE email = $1
              AND purpose = 'register'
            ORDER BY created_at DESC
            LIMIT 1
          `,
          [email]
        )
      : await this.database.query<VerificationCodeRow>(
          `
            SELECT id, code_hash, expires_at, consumed_at
            FROM email_verification_codes
            WHERE email = $1
              AND purpose = 'register'
            ORDER BY created_at DESC
            LIMIT 1
          `,
          [email]
        );

    return result.rows[0] || null;
  }

  private async createSessionForUser(
    client: DatabaseClient,
    user: UserRow,
    userAgent?: string,
    forwardedFor?: string
  ) {
    const sessionToken = randomBytes(32).toString("hex");
    const sessionTokenHash = hashSessionToken(sessionToken);
    const expiresAt = new Date(Date.now() + appEnv.authSessionTtlDays * 24 * 60 * 60 * 1000);

    await client.query(
      `
        INSERT INTO user_sessions (
          user_id,
          session_token_hash,
          user_agent,
          last_ip,
          expires_at,
          last_used_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW())
      `,
      [
        Number(user.id),
        sessionTokenHash,
        normalizeOptionalText(userAgent, 255),
        normalizeOptionalText(extractClientIp(forwardedFor), 64),
        expiresAt
      ]
    );

    return {
      token: sessionToken,
      user: {
        id: Number(user.id),
        email: user.email,
        displayName: user.display_name
      }
    };
  }
}

function normalizeEmail(email: string): string {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildDefaultDisplayName(email: string): string {
  return email.split("@")[0] || email;
}

function generateVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashVerificationCode(email: string, code: string): string {
  return createHash("sha256")
    .update(`register:${normalizeEmail(email)}:${String(code || "").trim()}`)
    .digest("hex");
}

function hashSessionToken(token: string): string {
  return createHash("sha256")
    .update(String(token || ""))
    .digest("hex");
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${PASSWORD_HASH_PREFIX}$${salt}$${derivedKey}`;
}

function verifyPassword(password: string, storedPasswordHash: string): boolean {
  const [prefix, salt, expectedHash] = String(storedPasswordHash || "").split("$");

  if (prefix !== PASSWORD_HASH_PREFIX || !salt || !expectedHash) {
    return false;
  }

  const actualHash = scryptSync(password, salt, 64).toString("hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");
  const actualBuffer = Buffer.from(actualHash, "hex");

  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

function parseBearerToken(authorization?: string): string {
  const normalizedAuthorization = String(authorization || "").trim();

  if (!normalizedAuthorization.toLowerCase().startsWith("bearer ")) {
    return "";
  }

  return normalizedAuthorization.slice(7).trim();
}

function formatFromAddress(): string {
  const fromName = appEnv.smtpFromName.replace(/"/g, "");
  return `"${fromName}" <${appEnv.smtpFromEmail}>`;
}

function normalizeOptionalText(value: string | undefined, maxLength: number): string | null {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return null;
  }

  return normalizedValue.slice(0, maxLength);
}

function extractClientIp(forwardedFor?: string): string {
  return String(forwardedFor || "")
    .split(",")[0]
    .trim();
}
