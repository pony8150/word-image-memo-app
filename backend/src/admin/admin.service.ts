import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { createHash, randomBytes, scryptSync } from "node:crypto";
import { AuthenticatedUser } from "../auth/auth.service";
import { DatabaseService } from "../database/database.service";
import { DatabaseClient } from "../database/mysql";
import { StorageService } from "../storage/storage.service";
import { WordsService } from "../words/words.service";
import {
  AdminOverviewResponse,
  AdminPagination,
  AdminPostItem,
  AdminPostListResponse,
  AdminUserItem,
  AdminUserListResponse
} from "./admin.types";

interface OverviewRow {
  total_users: number | string;
  admin_users: number | string;
  active_users_7d: number | string;
  total_posts: number | string;
  total_comments: number | string;
}

interface UserRow {
  id: number | string;
  email: string;
  username: string | null;
  display_name: string;
  password_hash?: string | null;
  auth_provider: "email" | "wechat" | "username";
  is_admin: number | string | boolean;
  created_at: Date | string;
  last_login_at: Date | string | null;
  post_count?: number | string;
}

interface PostRow {
  post_id: number | string;
  user_id: number | string;
  word_id: string;
  word_english: string;
  word_chinese: string;
  title: string;
  body: string | null;
  like_count: number | string;
  favorite_count: number | string;
  comment_count: number | string;
  share_count: number | string;
  created_at: Date | string;
  updated_at: Date | string;
  author_display_name: string;
  author_username: string | null;
  author_email: string;
  image_storage_type: string;
  image_storage_key: string | null;
  image_public_url: string | null;
}

interface WordImageCandidateRow {
  word_image_id: number | string;
}

const PASSWORD_HASH_PREFIX = "scrypt";
const MIN_PASSWORD_LENGTH = 6;
const USERNAME_MIN_LENGTH = 2;
const USERNAME_MAX_LENGTH = 20;
const USERNAME_PLACEHOLDER_EMAIL_DOMAIN = "local.tuge-danci.invalid";

@Injectable()
export class AdminService {
  constructor(
    private readonly database: DatabaseService,
    private readonly storage: StorageService,
    private readonly wordsService: WordsService
  ) {}

  async getOverview(user: AuthenticatedUser): Promise<AdminOverviewResponse> {
    this.assertAdmin(user);

    const result = await this.database.query<OverviewRow>(
      `
        SELECT
          (SELECT COUNT(*) FROM users) AS total_users,
          (SELECT COUNT(*) FROM users WHERE is_admin = TRUE) AS admin_users,
          (
            SELECT COUNT(*)
            FROM users
            WHERE last_login_at IS NOT NULL
              AND last_login_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          ) AS active_users_7d,
          (SELECT COUNT(*) FROM community_posts WHERE status = 'active') AS total_posts,
          (SELECT COUNT(*) FROM community_comments WHERE status = 'active') AS total_comments
      `
    );

    const row = result.rows[0];

    return {
      summary: {
        totalUsers: Number(row?.total_users || 0),
        adminUsers: Number(row?.admin_users || 0),
        activeUsers7d: Number(row?.active_users_7d || 0),
        totalPosts: Number(row?.total_posts || 0),
        totalComments: Number(row?.total_comments || 0)
      }
    };
  }

  async listUsers(
    user: AuthenticatedUser,
    input: { q?: string; page?: number; pageSize?: number }
  ): Promise<AdminUserListResponse> {
    this.assertAdmin(user);
    const query = normalizeSearchQuery(input.q);
    const pagination = normalizePagination(input.page, input.pageSize, 10, 100);
    const whereClause = query
      ? `
        WHERE
          u.username LIKE $1
          OR u.display_name LIKE $1
          OR u.email LIKE $1
      `
      : "";
    const params = query ? [`%${query}%`] : [];

    const countResult = await this.database.query<{ total: number | string }>(
      `
        SELECT COUNT(*) AS total
        FROM users u
        ${whereClause}
      `,
      params
    );

    const rowsResult = await this.database.query<UserRow>(
      `
        SELECT
          u.id,
          u.email,
          u.username,
          u.display_name,
          u.auth_provider,
          u.is_admin,
          u.created_at,
          u.last_login_at,
          COALESCE(post_stats.post_count, 0) AS post_count
        FROM users u
        LEFT JOIN (
          SELECT user_id, COUNT(*) AS post_count
          FROM community_posts
          WHERE status = 'active'
          GROUP BY user_id
        ) post_stats
          ON post_stats.user_id = u.id
        ${whereClause}
        ORDER BY u.created_at DESC, u.id DESC
        LIMIT ${pagination.offset}, ${pagination.pageSize}
      `,
      params
    );

    return {
      items: rowsResult.rows.map((row) => this.mapAdminUserRow(row)),
      pagination: finalizePagination(pagination, Number(countResult.rows[0]?.total || 0))
    };
  }

  async createUser(
    user: AuthenticatedUser,
    input: {
      username?: string;
      displayName?: string;
      password?: string;
      isAdmin?: boolean;
    }
  ): Promise<{ user: AdminUserItem }> {
    this.assertAdmin(user);
    const normalizedUsername = normalizeUsername(input.username);
    const normalizedDisplayName = normalizeDisplayName(input.displayName, normalizedUsername);
    const normalizedPassword = String(input.password || "");
    const isAdmin = Boolean(input.isAdmin);

    if (!isValidUsername(normalizedUsername)) {
      throw new BadRequestException(
        `Username must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters and can only contain letters, numbers, underscores, or hyphens.`
      );
    }

    if (!normalizedDisplayName) {
      throw new BadRequestException("Display name is required.");
    }

    if (normalizedPassword.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }

    const existingUsername = await this.findUserByUsername(normalizedUsername);

    if (existingUsername) {
      throw new ConflictException("This username is already registered.");
    }

    const email = buildUsernamePlaceholderEmail(normalizedUsername);
    const passwordHash = hashPassword(normalizedPassword);

    const insertResult = await this.database.query(
      `
        INSERT INTO users (
          email,
          username,
          display_name,
          password_hash,
          auth_provider,
          email_verified,
          is_admin
        )
        VALUES ($1, $2, $3, $4, 'username', TRUE, $5)
      `,
      [email, normalizedUsername, normalizedDisplayName, passwordHash, isAdmin]
    );

    const createdUser = await this.getUserById(Number(insertResult.insertId));

    if (!createdUser) {
      throw new NotFoundException("Created user could not be loaded.");
    }

    return { user: createdUser };
  }

  async updateUser(
    currentUser: AuthenticatedUser,
    targetUserId: number,
    input: {
      username?: string;
      displayName?: string;
      password?: string;
      isAdmin?: boolean;
    }
  ): Promise<{ user: AdminUserItem }> {
    this.assertAdmin(currentUser);
    const existingUser = await this.findUserByIdRaw(targetUserId);

    if (!existingUser) {
      throw new NotFoundException("User not found.");
    }

    const nextUsername =
      input.username === undefined ? existingUser.username || "" : normalizeUsername(input.username);
    const nextDisplayName =
      input.displayName === undefined
        ? existingUser.display_name
        : normalizeDisplayName(input.displayName, nextUsername || existingUser.display_name);
    const nextPassword = String(input.password || "");
    const nextIsAdmin =
      input.isAdmin === undefined ? Boolean(Number(existingUser.is_admin || 0)) : Boolean(input.isAdmin);

    if (existingUser.auth_provider === "username" && !isValidUsername(nextUsername)) {
      throw new BadRequestException(
        `Username must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters and can only contain letters, numbers, underscores, or hyphens.`
      );
    }

    if (nextUsername && !isValidUsername(nextUsername)) {
      throw new BadRequestException(
        `Username must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters and can only contain letters, numbers, underscores, or hyphens.`
      );
    }

    if (!nextDisplayName) {
      throw new BadRequestException("Display name is required.");
    }

    if (nextPassword && nextPassword.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }

    if (
      existingUser.username &&
      nextUsername &&
      nextUsername !== existingUser.username
    ) {
      const conflictUser = await this.findUserByUsername(nextUsername);

      if (conflictUser && Number(conflictUser.id) !== targetUserId) {
        throw new ConflictException("This username is already registered.");
      }
    }

    if (currentUser.id === targetUserId && !nextIsAdmin) {
      throw new BadRequestException("You cannot remove your own admin access.");
    }

    const passwordHash = nextPassword ? hashPassword(nextPassword) : existingUser.password_hash;
    const nextEmail =
      existingUser.auth_provider === "username" && nextUsername
        ? buildUsernamePlaceholderEmail(nextUsername)
        : existingUser.email;

    await this.database.query(
      `
        UPDATE users
        SET
          email = $1,
          username = $2,
          display_name = $3,
          password_hash = $4,
          is_admin = $5
        WHERE id = $6
      `,
      [nextEmail, nextUsername || null, nextDisplayName, passwordHash, nextIsAdmin, targetUserId]
    );

    const updatedUser = await this.getUserById(targetUserId);

    if (!updatedUser) {
      throw new NotFoundException("Updated user could not be loaded.");
    }

    return { user: updatedUser };
  }

  async deleteUser(currentUser: AuthenticatedUser, targetUserId: number): Promise<{ ok: true }> {
    this.assertAdmin(currentUser);

    if (currentUser.id === targetUserId) {
      throw new BadRequestException("You cannot delete your own account.");
    }

    const existingUser = await this.findUserByIdRaw(targetUserId);

    if (!existingUser) {
      throw new NotFoundException("User not found.");
    }

    if (Boolean(Number(existingUser.is_admin || 0))) {
      const adminCountResult = await this.database.query<{ total: number | string }>(
        `
          SELECT COUNT(*) AS total
          FROM users
          WHERE is_admin = TRUE
        `
      );

      if (Number(adminCountResult.rows[0]?.total || 0) <= 1) {
        throw new BadRequestException("You cannot delete the last admin account.");
      }
    }

    await this.database.query(
      `
        DELETE FROM users
        WHERE id = $1
      `,
      [targetUserId]
    );

    return { ok: true };
  }

  async listPosts(
    user: AuthenticatedUser,
    input: { q?: string; page?: number; pageSize?: number }
  ): Promise<AdminPostListResponse> {
    this.assertAdmin(user);
    const query = normalizeSearchQuery(input.q);
    const pagination = normalizePagination(input.page, input.pageSize, 8, 50);
    const whereClause = query
      ? `
        AND (
          p.title LIKE $1
          OR p.body LIKE $1
          OR w.english LIKE $1
          OR w.chinese LIKE $1
          OR u.display_name LIKE $1
          OR u.username LIKE $1
        )
      `
      : "";
    const params = query ? [`%${query}%`] : [];

    const countResult = await this.database.query<{ total: number | string }>(
      `
        SELECT COUNT(*) AS total
        FROM community_posts p
        INNER JOIN users u
          ON u.id = p.user_id
        INNER JOIN words w
          ON w.id = p.word_id
        WHERE p.status = 'active'
        ${whereClause}
      `,
      params
    );

    const rowsResult = await this.database.query<PostRow>(
      `
        SELECT
          p.id AS post_id,
          p.user_id,
          p.word_id,
          w.english AS word_english,
          w.chinese AS word_chinese,
          p.title,
          p.body,
          p.like_count,
          p.favorite_count,
          p.comment_count,
          p.share_count,
          p.created_at,
          p.updated_at,
          u.display_name AS author_display_name,
          u.username AS author_username,
          u.email AS author_email,
          ia.storage_type AS image_storage_type,
          ia.storage_key AS image_storage_key,
          ia.public_url AS image_public_url
        FROM community_posts p
        INNER JOIN users u
          ON u.id = p.user_id
        INNER JOIN words w
          ON w.id = p.word_id
        INNER JOIN word_images wi
          ON wi.id = p.word_image_id
        INNER JOIN image_assets ia
          ON ia.id = wi.image_asset_id
        WHERE p.status = 'active'
        ${whereClause}
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT ${pagination.offset}, ${pagination.pageSize}
      `,
      params
    );

    return {
      items: rowsResult.rows.map((row) => this.mapAdminPostRow(row)),
      pagination: finalizePagination(pagination, Number(countResult.rows[0]?.total || 0))
    };
  }

  async createPost(
    user: AuthenticatedUser,
    input: { userId?: number; wordId?: string; title?: string; body?: string }
  ): Promise<{ post: AdminPostItem }> {
    this.assertAdmin(user);
    const authorUserId = Number(input.userId || 0);
    const wordId = String(input.wordId || "").trim();
    const body = normalizeNullableText(input.body);
    const titleInput = String(input.title || "").trim();

    if (!authorUserId) {
      throw new BadRequestException("Author user is required.");
    }

    if (!wordId) {
      throw new BadRequestException("Word ID is required.");
    }

    const author = await this.findUserByIdRaw(authorUserId);

    if (!author) {
      throw new NotFoundException("Author user not found.");
    }

    const word = await this.wordsService.getWordByIdForUser(wordId, authorUserId);

    if (!word) {
      throw new NotFoundException("Word not found.");
    }

    const imageCandidate = await this.findPreferredWordImage(wordId, authorUserId);

    if (!imageCandidate) {
      throw new BadRequestException("This word does not have an active image that can be published.");
    }

    const title = titleInput || word.english;
    const insertResult = await this.database.query(
      `
        INSERT INTO community_posts (
          user_id,
          word_id,
          word_image_id,
          title,
          body
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
      [authorUserId, wordId, Number(imageCandidate.word_image_id), title, body]
    );

    const createdPost = await this.getPostById(Number(insertResult.insertId));

    if (!createdPost) {
      throw new NotFoundException("Created post could not be loaded.");
    }

    return { post: createdPost };
  }

  async updatePost(
    user: AuthenticatedUser,
    postId: number,
    input: { title?: string; body?: string }
  ): Promise<{ post: AdminPostItem }> {
    this.assertAdmin(user);

    const existingPost = await this.getPostById(postId);

    if (!existingPost) {
      throw new NotFoundException("Post not found.");
    }

    const nextTitle = String(input.title ?? existingPost.title).trim();
    const nextBody =
      input.body === undefined ? normalizeNullableText(existingPost.body) : normalizeNullableText(input.body);

    if (!nextTitle) {
      throw new BadRequestException("Post title is required.");
    }

    await this.database.query(
      `
        UPDATE community_posts
        SET
          title = $1,
          body = $2
        WHERE id = $3
          AND status = 'active'
      `,
      [nextTitle, nextBody, postId]
    );

    const updatedPost = await this.getPostById(postId);

    if (!updatedPost) {
      throw new NotFoundException("Updated post could not be loaded.");
    }

    return { post: updatedPost };
  }

  async deletePost(user: AuthenticatedUser, postId: number): Promise<{ ok: true }> {
    this.assertAdmin(user);
    const existingPost = await this.getPostById(postId);

    if (!existingPost) {
      throw new NotFoundException("Post not found.");
    }

    await this.database.query(
      `
        DELETE FROM community_posts
        WHERE id = $1
      `,
      [postId]
    );

    return { ok: true };
  }

  private assertAdmin(user: AuthenticatedUser): void {
    if (user.isAdmin) {
      return;
    }

    throw new ForbiddenException("Admin access is required.");
  }

  private async getUserById(userId: number): Promise<AdminUserItem | null> {
    const result = await this.database.query<UserRow>(
      `
        SELECT
          u.id,
          u.email,
          u.username,
          u.display_name,
          u.auth_provider,
          u.is_admin,
          u.created_at,
          u.last_login_at,
          COALESCE(post_stats.post_count, 0) AS post_count
        FROM users u
        LEFT JOIN (
          SELECT user_id, COUNT(*) AS post_count
          FROM community_posts
          WHERE status = 'active'
          GROUP BY user_id
        ) post_stats
          ON post_stats.user_id = u.id
        WHERE u.id = $1
        LIMIT 1
      `,
      [userId]
    );

    return result.rows[0] ? this.mapAdminUserRow(result.rows[0]) : null;
  }

  private async findUserByIdRaw(userId: number, client?: DatabaseClient): Promise<UserRow | null> {
    const result = client
      ? await client.query<UserRow>(
          `
            SELECT
              id,
              email,
              username,
              display_name,
              password_hash AS password_hash,
              auth_provider,
              is_admin,
              created_at,
              last_login_at
            FROM users
            WHERE id = $1
            LIMIT 1
          `,
          [userId]
        )
      : await this.database.query<UserRow>(
          `
            SELECT
              id,
              email,
              username,
              display_name,
              password_hash AS password_hash,
              auth_provider,
              is_admin,
              created_at,
              last_login_at
            FROM users
            WHERE id = $1
            LIMIT 1
          `,
          [userId]
        );

    return result.rows[0] || null;
  }

  private async findUserByUsername(username: string): Promise<UserRow | null> {
    const result = await this.database.query<UserRow>(
      `
        SELECT
          id,
          email,
          username,
          display_name,
          password_hash AS password_hash,
          auth_provider,
          is_admin,
          created_at,
          last_login_at
        FROM users
        WHERE username = $1
        LIMIT 1
      `,
      [username]
    );

    return result.rows[0] || null;
  }

  private async getPostById(postId: number): Promise<AdminPostItem | null> {
    const result = await this.database.query<PostRow>(
      `
        SELECT
          p.id AS post_id,
          p.user_id,
          p.word_id,
          w.english AS word_english,
          w.chinese AS word_chinese,
          p.title,
          p.body,
          p.like_count,
          p.favorite_count,
          p.comment_count,
          p.share_count,
          p.created_at,
          p.updated_at,
          u.display_name AS author_display_name,
          u.username AS author_username,
          u.email AS author_email,
          ia.storage_type AS image_storage_type,
          ia.storage_key AS image_storage_key,
          ia.public_url AS image_public_url
        FROM community_posts p
        INNER JOIN users u
          ON u.id = p.user_id
        INNER JOIN words w
          ON w.id = p.word_id
        INNER JOIN word_images wi
          ON wi.id = p.word_image_id
        INNER JOIN image_assets ia
          ON ia.id = wi.image_asset_id
        WHERE p.id = $1
          AND p.status = 'active'
        LIMIT 1
      `,
      [postId]
    );

    return result.rows[0] ? this.mapAdminPostRow(result.rows[0]) : null;
  }

  private async findPreferredWordImage(
    wordId: string,
    ownerUserId: number
  ): Promise<WordImageCandidateRow | null> {
    const result = await this.database.query<WordImageCandidateRow>(
      `
        SELECT
          wi.id AS word_image_id
        FROM word_images wi
        WHERE wi.word_id = $1
          AND wi.status = 'active'
          AND (
            wi.scope = 'default'
            OR (
              wi.scope = 'private'
              AND wi.owner_user_id = $2
            )
          )
        ORDER BY
          CASE
            WHEN wi.scope = 'default' THEN 0
            ELSE 1
          END ASC,
          wi.sort_order ASC,
          wi.id ASC
        LIMIT 1
      `,
      [wordId, ownerUserId]
    );

    return result.rows[0] || null;
  }

  private mapAdminUserRow(row: UserRow): AdminUserItem {
    const email = isUsernamePlaceholderEmail(row.email) ? null : row.email;

    return {
      id: Number(row.id),
      email,
      username: row.username,
      displayName: row.display_name,
      authProvider: row.auth_provider,
      isAdmin: Boolean(Number(row.is_admin || 0)),
      postCount: Number(row.post_count || 0),
      createdAt: toIsoString(row.created_at),
      lastLoginAt: row.last_login_at ? toIsoString(row.last_login_at) : null
    };
  }

  private mapAdminPostRow(row: PostRow): AdminPostItem {
    return {
      id: Number(row.post_id),
      userId: Number(row.user_id),
      wordId: row.word_id,
      wordEnglish: row.word_english,
      wordChinese: row.word_chinese,
      title: row.title,
      body: row.body,
      imageUrl: this.storage.resolvePublicUrl({
        storageType: row.image_storage_type,
        storageKey: row.image_storage_key,
        publicUrl: row.image_public_url
      }),
      likeCount: Number(row.like_count || 0),
      favoriteCount: Number(row.favorite_count || 0),
      commentCount: Number(row.comment_count || 0),
      shareCount: Number(row.share_count || 0),
      createdAt: toIsoString(row.created_at),
      updatedAt: toIsoString(row.updated_at),
      author: {
        id: Number(row.user_id),
        displayName: row.author_display_name,
        username: row.author_username,
        email: isUsernamePlaceholderEmail(row.author_email) ? null : row.author_email
      }
    };
  }
}

function normalizePagination(
  page: number | undefined,
  pageSize: number | undefined,
  defaultPageSize: number,
  maxPageSize: number
): { page: number; pageSize: number; offset: number } {
  const normalizedPage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const normalizedPageSize =
    Number.isFinite(Number(pageSize)) && Number(pageSize) > 0
      ? Math.min(Number(pageSize), maxPageSize)
      : defaultPageSize;

  return {
    page: normalizedPage,
    pageSize: normalizedPageSize,
    offset: (normalizedPage - 1) * normalizedPageSize
  };
}

function finalizePagination(
  pagination: { page: number; pageSize: number },
  total: number
): AdminPagination {
  return {
    page: pagination.page,
    pageSize: pagination.pageSize,
    total,
    pageCount: Math.max(1, Math.ceil(total / pagination.pageSize))
  };
}

function normalizeSearchQuery(value: string | undefined): string {
  return String(value || "").trim();
}

function normalizeUsername(value: string | undefined): string {
  return String(value || "").trim();
}

function normalizeDisplayName(value: string | undefined, fallback = ""): string {
  return String(value || "").trim() || String(fallback || "").trim();
}

function normalizeNullableText(value: string | null | undefined): string | null {
  const normalizedValue = String(value || "").trim();
  return normalizedValue ? normalizedValue : null;
}

function isValidUsername(username: string): boolean {
  const length = Array.from(username).length;

  if (length < USERNAME_MIN_LENGTH || length > USERNAME_MAX_LENGTH) {
    return false;
  }

  return /^[\p{L}\p{N}_-]+$/u.test(username);
}

function buildUsernamePlaceholderEmail(username: string): string {
  const digest = createHash("sha256")
    .update(username)
    .digest("hex")
    .slice(0, 24);

  return `username-${digest}@${USERNAME_PLACEHOLDER_EMAIL_DOMAIN}`;
}

function isUsernamePlaceholderEmail(email: string): boolean {
  return String(email || "").toLowerCase().endsWith(`@${USERNAME_PLACEHOLDER_EMAIL_DOMAIN}`);
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${PASSWORD_HASH_PREFIX}$${salt}$${derivedKey}`;
}

function toIsoString(value: Date | string): string {
  return new Date(value).toISOString();
}
