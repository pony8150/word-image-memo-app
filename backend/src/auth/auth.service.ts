import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import * as nodemailer from "nodemailer";
import { APP_EMAIL_SUBJECT_PREFIX } from "../config/branding";
import { appEnv } from "../config/env";
import { DatabaseService } from "../database/database.service";
import type { DatabaseClient } from "../database/mysql";

type AuthProvider = "email" | "wechat" | "username";

interface UserRow {
  id: number | string;
  email: string;
  username: string | null;
  display_name: string;
  password_hash: string | null;
  auth_provider: AuthProvider;
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
  email: string | null;
  username: string | null;
  displayName: string;
  authProvider: AuthProvider;
}

const REGISTER_CODE_COOLDOWN_SECONDS = 60;
const REGISTER_CODE_TTL_MINUTES = 10;
const MIN_PASSWORD_LENGTH = 6;
const PASSWORD_HASH_PREFIX = "scrypt";
const USERNAME_MIN_LENGTH = 2;
const USERNAME_MAX_LENGTH = 20;
const USERNAME_PLACEHOLDER_EMAIL_DOMAIN = "local.tuge-danci.invalid";

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
        subject: `[${APP_EMAIL_SUBJECT_PREFIX}] Verification code`,
        text: `Your verification code is ${verificationCode}. It expires in ${REGISTER_CODE_TTL_MINUTES} minutes.`
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
            username,
            display_name,
            password_hash,
            auth_provider,
            email_verified,
            last_login_at
          )
          VALUES ($1, NULL, $2, $3, 'email', TRUE, NOW())
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

      return this.createSessionForUser(
        client,
        {
          id: userId,
          email: normalizedEmail,
          username: null,
          display_name: displayName,
          password_hash: passwordHash,
          auth_provider: "email"
        },
        userAgent,
        forwardedFor
      );
    });
  }

  async registerWithUsername(
    username: string,
    password: string,
    userAgent?: string,
    forwardedFor?: string
  ) {
    const normalizedUsername = normalizeUsername(username);
    const normalizedPassword = String(password || "");

    if (!isValidUsername(normalizedUsername)) {
      throw new BadRequestException(
        `Username must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters and can only contain letters, numbers, underscores, or hyphens.`
      );
    }

    if (normalizedPassword.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }

    return this.database.transaction(async (client) => {
      const existingUser = await this.findUserByUsername(normalizedUsername, client);

      if (existingUser) {
        throw new ConflictException("This username is already registered.");
      }

      const passwordHash = hashPassword(normalizedPassword);
      const placeholderEmail = buildUsernamePlaceholderEmail(normalizedUsername);
      const insertUserResult = await client.query(
        `
          INSERT INTO users (
            email,
            username,
            display_name,
            password_hash,
            auth_provider,
            email_verified,
            last_login_at
          )
          VALUES ($1, $2, $2, $3, 'username', TRUE, NOW())
        `,
        [placeholderEmail, normalizedUsername, passwordHash]
      );
      const userId = Number(insertUserResult.insertId);

      return this.createSessionForUser(
        client,
        {
          id: userId,
          email: placeholderEmail,
          username: normalizedUsername,
          display_name: normalizedUsername,
          password_hash: passwordHash,
          auth_provider: "username"
        },
        userAgent,
        forwardedFor
      );
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

  async loginWithUsername(
    username: string,
    password: string,
    userAgent?: string,
    forwardedFor?: string
  ) {
    const normalizedUsername = normalizeUsername(username);
    const normalizedPassword = String(password || "");

    if (!isValidUsername(normalizedUsername)) {
      throw new BadRequestException("Please enter a valid username.");
    }

    const user = await this.findUserByUsername(normalizedUsername);

    if (!user?.password_hash || !verifyPassword(normalizedPassword, user.password_hash)) {
      throw new UnauthorizedException("Username or password is incorrect.");
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
          u.username,
          u.display_name,
          u.password_hash,
          u.auth_provider,
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

    return toAuthenticatedUser(sessionUser);
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
            SELECT id, email, username, display_name, password_hash, auth_provider
            FROM users
            WHERE email = $1
            LIMIT 1
          `,
          [email]
        )
      : await this.database.query<UserRow>(
          `
            SELECT id, email, username, display_name, password_hash, auth_provider
            FROM users
            WHERE email = $1
            LIMIT 1
          `,
          [email]
        );

    return result.rows[0] || null;
  }

  private async findUserByUsername(
    username: string,
    client?: DatabaseClient
  ): Promise<UserRow | null> {
    const result = client
      ? await client.query<UserRow>(
          `
            SELECT id, email, username, display_name, password_hash, auth_provider
            FROM users
            WHERE username = $1
            LIMIT 1
          `,
          [username]
        )
      : await this.database.query<UserRow>(
          `
            SELECT id, email, username, display_name, password_hash, auth_provider
            FROM users
            WHERE username = $1
            LIMIT 1
          `,
          [username]
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
      user: toAuthenticatedUser(user)
    };
  }
}

function normalizeEmail(email: string): string {
  return String(email || "").trim().toLowerCase();
}

function normalizeUsername(username: string): string {
  return String(username || "").trim();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username: string): boolean {
  const normalizedUsername = normalizeUsername(username);
  const length = Array.from(normalizedUsername).length;

  if (length < USERNAME_MIN_LENGTH || length > USERNAME_MAX_LENGTH) {
    return false;
  }

  return /^[\p{L}\p{N}_-]+$/u.test(normalizedUsername);
}

function buildDefaultDisplayName(email: string): string {
  return email.split("@")[0] || email;
}

function buildUsernamePlaceholderEmail(username: string): string {
  const digest = createHash("sha256")
    .update(normalizeUsername(username))
    .digest("hex")
    .slice(0, 24);

  return `username-${digest}@${USERNAME_PLACEHOLDER_EMAIL_DOMAIN}`;
}

function toAuthenticatedUser(user: UserRow | SessionUserRow): AuthenticatedUser {
  const publicEmail =
    user.auth_provider === "username" || isUsernamePlaceholderEmail(user.email) ? null : user.email;

  return {
    id: Number(user.id),
    email: publicEmail,
    username: user.username,
    displayName: user.display_name,
    authProvider: user.auth_provider
  };
}

function isUsernamePlaceholderEmail(email: string): boolean {
  return String(email || "").toLowerCase().endsWith(`@${USERNAME_PLACEHOLDER_EMAIL_DOMAIN}`);
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
