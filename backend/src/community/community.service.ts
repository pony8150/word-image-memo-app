import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { AuthenticatedUser } from "../auth/auth.service";
import { DatabaseService } from "../database/database.service";
import { DatabaseClient } from "../database/mysql";
import { StorageService } from "../storage/storage.service";
import { WordsService } from "../words/words.service";
import { LearningDeckWord } from "../words/words.types";
import {
  CommunityAdminOverview,
  CommunityAdminPost,
  CommunityComment,
  CommunityFeedPost,
  CommunityPostDetail
} from "./community.types";

const COMMUNITY_POST_BODY_MAX_LENGTH = 160;
const COMMUNITY_COMMENT_MAX_LENGTH = 240;

interface FeedRow {
  post_id: number | string;
  word_id: string;
  title: string;
  body: string | null;
  like_count: number | string;
  favorite_count: number | string;
  comment_count: number | string;
  share_count: number | string;
  created_at: Date | string;
  user_id: number | string;
  user_email: string;
  user_display_name: string;
  user_avatar_url: string | null;
  image_storage_type: string;
  image_storage_key: string | null;
  image_public_url: string | null;
  viewer_liked: number | string;
  viewer_favorited: number | string;
}

interface DetailRow extends FeedRow {
  english: string;
  chinese: string;
  example_text: string | null;
  example_translation: string | null;
  image_reason: string | null;
  scene: string | null;
}

interface CommentRow {
  comment_id: number | string;
  content: string;
  like_count: number | string;
  created_at: Date | string;
  user_id: number | string;
  user_email: string;
  user_display_name: string;
  user_avatar_url: string | null;
  viewer_liked: number | string;
}

interface PublishPostInput {
  wordId: string;
  wordImageId: number;
  body: string;
}

interface PublishImageRow {
  word_id: string;
  image_id: number | string;
  scope: "default" | "private";
  owner_user_id: number | string | null;
  image_storage_type: string;
  image_storage_key: string | null;
  image_public_url: string | null;
}

interface FavoriteTargetRow {
  post_id: number | string;
  user_id: number | string;
  word_id: string;
  image_asset_id: number | string;
  source_label: string | null;
  source_credit: string | null;
}

interface AdminSummaryRow {
  total_users: number | string;
  admin_users: number | string;
  active_users_7d: number | string;
  active_posts: number | string;
  deleted_posts: number | string;
  active_comments: number | string;
}

interface AdminPostRow {
  post_id: number | string;
  word_id: string;
  title: string;
  body: string | null;
  status: "active" | "deleted";
  like_count: number | string;
  favorite_count: number | string;
  comment_count: number | string;
  share_count: number | string;
  created_at: Date | string;
  user_id: number | string;
  user_email: string;
  user_display_name: string;
  user_avatar_url: string | null;
  image_storage_type: string;
  image_storage_key: string | null;
  image_public_url: string | null;
}

@Injectable()
export class CommunityService {
  constructor(
    private readonly database: DatabaseService,
    private readonly storage: StorageService,
    private readonly wordsService: WordsService
  ) {}

  async getFeed(userId: number): Promise<{ posts: CommunityFeedPost[] }> {
    const result = await this.database.query<FeedRow>(
      `
        SELECT
          p.id AS post_id,
          p.word_id,
          p.title,
          p.body,
          p.like_count,
          p.favorite_count,
          p.comment_count,
          p.share_count,
          p.created_at,
          u.id AS user_id,
          u.email AS user_email,
          u.display_name AS user_display_name,
          u.avatar_url AS user_avatar_url,
          ia.storage_type AS image_storage_type,
          ia.storage_key AS image_storage_key,
          ia.public_url AS image_public_url,
          EXISTS (
            SELECT 1
            FROM community_post_likes pl
            WHERE pl.post_id = p.id
              AND pl.user_id = $1
          ) AS viewer_liked,
          EXISTS (
            SELECT 1
            FROM community_post_favorites pf
            WHERE pf.post_id = p.id
              AND pf.user_id = $1
          ) AS viewer_favorited
        FROM community_posts p
        INNER JOIN users u
          ON u.id = p.user_id
        INNER JOIN word_images wi
          ON wi.id = p.word_image_id
        INNER JOIN image_assets ia
          ON ia.id = wi.image_asset_id
        WHERE p.status = 'active'
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT 120
      `,
      [userId]
    );

    return {
      posts: result.rows.map((row) => this.mapFeedRow(row))
    };
  }

  async getPostDetail(postId: number, userId: number): Promise<{ post: CommunityPostDetail }> {
    const postResult = await this.database.query<DetailRow>(
      `
        SELECT
          p.id AS post_id,
          p.word_id,
          p.title,
          p.body,
          p.like_count,
          p.favorite_count,
          p.comment_count,
          p.share_count,
          p.created_at,
          u.id AS user_id,
          u.email AS user_email,
          u.display_name AS user_display_name,
          u.avatar_url AS user_avatar_url,
          ia.storage_type AS image_storage_type,
          ia.storage_key AS image_storage_key,
          ia.public_url AS image_public_url,
          EXISTS (
            SELECT 1
            FROM community_post_likes pl
            WHERE pl.post_id = p.id
              AND pl.user_id = $2
          ) AS viewer_liked,
          EXISTS (
            SELECT 1
            FROM community_post_favorites pf
            WHERE pf.post_id = p.id
              AND pf.user_id = $2
          ) AS viewer_favorited,
          w.english,
          w.chinese,
          w.example_text,
          w.example_translation,
          w.image_reason,
          w.scene
        FROM community_posts p
        INNER JOIN users u
          ON u.id = p.user_id
        INNER JOIN word_images wi
          ON wi.id = p.word_image_id
        INNER JOIN image_assets ia
          ON ia.id = wi.image_asset_id
        INNER JOIN words w
          ON w.id = p.word_id
        WHERE p.id = $1
          AND p.status = 'active'
        LIMIT 1
      `,
      [postId, userId]
    );

    const row = postResult.rows[0];

    if (!row) {
      throw new NotFoundException("Community post not found.");
    }

    const comments = await this.listComments(postId, userId);
    const basePost = this.mapFeedRow(row);

    return {
      post: {
        ...basePost,
        word: {
          english: row.english,
          chinese: row.chinese,
          example: row.example_text,
          exampleChinese: row.example_translation,
          imageReason: row.image_reason,
          scene: row.scene
        },
        comments
      }
    };
  }

  async getAdminOverview(user: AuthenticatedUser): Promise<CommunityAdminOverview> {
    this.assertAdmin(user);

    const summaryResult = await this.database.query<AdminSummaryRow>(
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
          (SELECT COUNT(*) FROM community_posts WHERE status = 'active') AS active_posts,
          (SELECT COUNT(*) FROM community_posts WHERE status = 'deleted') AS deleted_posts,
          (
            SELECT COUNT(*)
            FROM community_comments c
            INNER JOIN community_posts p
              ON p.id = c.post_id
            WHERE c.status = 'active'
              AND p.status = 'active'
          ) AS active_comments
      `
    );

    const recentPostsResult = await this.database.query<AdminPostRow>(
      `
        SELECT
          p.id AS post_id,
          p.word_id,
          p.title,
          p.body,
          p.status,
          p.like_count,
          p.favorite_count,
          p.comment_count,
          p.share_count,
          p.created_at,
          u.id AS user_id,
          u.email AS user_email,
          u.display_name AS user_display_name,
          u.avatar_url AS user_avatar_url,
          ia.storage_type AS image_storage_type,
          ia.storage_key AS image_storage_key,
          ia.public_url AS image_public_url
        FROM community_posts p
        INNER JOIN users u
          ON u.id = p.user_id
        INNER JOIN word_images wi
          ON wi.id = p.word_image_id
        INNER JOIN image_assets ia
          ON ia.id = wi.image_asset_id
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT 80
      `
    );

    const summary = summaryResult.rows[0];

    return {
      summary: {
        totalUsers: Number(summary?.total_users || 0),
        adminUsers: Number(summary?.admin_users || 0),
        activeUsers7d: Number(summary?.active_users_7d || 0),
        activePosts: Number(summary?.active_posts || 0),
        deletedPosts: Number(summary?.deleted_posts || 0),
        activeComments: Number(summary?.active_comments || 0)
      },
      recentPosts: recentPostsResult.rows.map((row) => this.mapAdminPostRow(row))
    };
  }

  async deletePostAsAdmin(postId: number, user: AuthenticatedUser): Promise<{ ok: true }> {
    this.assertAdmin(user);

    await this.database.transaction(async (client) => {
      await this.ensureActivePost(client, postId);

      await client.query(
        `
          UPDATE community_posts
          SET status = 'deleted'
          WHERE id = $1
        `,
        [postId]
      );

      await client.query(
        `
          UPDATE community_comments
          SET status = 'deleted'
          WHERE post_id = $1
            AND status = 'active'
        `,
        [postId]
      );
    });

    return { ok: true };
  }

  async publishPost(user: AuthenticatedUser, input: PublishPostInput): Promise<{ post: CommunityPostDetail }> {
    const wordId = String(input.wordId || "").trim();
    const body = String(input.body || "").trim();
    const wordImageId = Number(input.wordImageId || 0);

    if (!wordId || !wordImageId) {
      throw new BadRequestException("Word and image are required.");
    }

    if (!body) {
      throw new BadRequestException("Please write a short note before publishing.");
    }

    if (body.length > COMMUNITY_POST_BODY_MAX_LENGTH) {
      throw new BadRequestException(`Post body cannot exceed ${COMMUNITY_POST_BODY_MAX_LENGTH} characters.`);
    }

    const word = await this.wordsService.getWordByIdForUser(wordId, user.id);

    if (!word) {
      throw new NotFoundException("Word not found.");
    }

    let createdPostId = 0;

    await this.database.transaction(async (client) => {
      const imageRow = await this.getPublishableImage(client, wordImageId);

      if (!imageRow || imageRow.word_id !== wordId) {
        throw new NotFoundException("Word image not found.");
      }

      if (imageRow.scope === "private" && Number(imageRow.owner_user_id || 0) !== user.id) {
        throw new NotFoundException("Word image not found.");
      }

      const title = word.english;
      const normalizedBody = body;

      const insertResult = await client.query(
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
        [user.id, wordId, wordImageId, title, normalizedBody]
      );

      createdPostId = insertResult.insertId;
    });

    return this.getPostDetail(createdPostId, user.id);
  }

  async createComment(
    postId: number,
    user: AuthenticatedUser,
    content: string
  ): Promise<{ post: CommunityPostDetail }> {
    const normalizedContent = String(content || "").trim();

    if (!normalizedContent) {
      throw new BadRequestException("Comment cannot be empty.");
    }

    if (normalizedContent.length > COMMUNITY_COMMENT_MAX_LENGTH) {
      throw new BadRequestException(`Comment cannot exceed ${COMMUNITY_COMMENT_MAX_LENGTH} characters.`);
    }

    await this.database.transaction(async (client) => {
      await this.ensureActivePost(client, postId);

      await client.query(
        `
          INSERT INTO community_comments (
            post_id,
            user_id,
            content
          )
          VALUES ($1, $2, $3)
        `,
        [postId, user.id, normalizedContent]
      );

      await client.query(
        `
          UPDATE community_posts
          SET comment_count = (
            SELECT COUNT(*)
            FROM community_comments
            WHERE post_id = $1
              AND status = 'active'
          )
          WHERE id = $1
        `,
        [postId]
      );
    });

    return this.getPostDetail(postId, user.id);
  }

  async togglePostLike(postId: number, userId: number): Promise<{ post: CommunityPostDetail }> {
    await this.database.transaction(async (client) => {
      await this.ensureActivePost(client, postId);
      const existing = await client.query<{ id: number | string }>(
        `
          SELECT id
          FROM community_post_likes
          WHERE post_id = $1
            AND user_id = $2
          LIMIT 1
        `,
        [postId, userId]
      );

      if (existing.rows[0]) {
        await client.query(
          `
            DELETE FROM community_post_likes
            WHERE post_id = $1
              AND user_id = $2
          `,
          [postId, userId]
        );
      } else {
        await client.query(
          `
            INSERT INTO community_post_likes (post_id, user_id)
            VALUES ($1, $2)
          `,
          [postId, userId]
        );
      }

      await this.refreshPostReactionCounts(client, postId);
    });

    return this.getPostDetail(postId, userId);
  }

  async favoritePost(
    postId: number,
    user: AuthenticatedUser
  ): Promise<{ post: CommunityPostDetail; word: LearningDeckWord | null }> {
    const updatedWord = await this.database.transaction(async (client) => {
      const target = await this.getFavoriteTarget(client, postId);

      if (!target) {
        throw new NotFoundException("Community post not found.");
      }

      if (Number(target.user_id || 0) === user.id) {
        throw new BadRequestException("You cannot favorite your own community post.");
      }

      const existingFavorite = await client.query<{ id: number | string }>(
        `
          SELECT id
          FROM community_post_favorites
          WHERE post_id = $1
            AND user_id = $2
          LIMIT 1
        `,
        [postId, user.id]
      );

      if (!existingFavorite.rows[0]) {
        await client.query(
          `
            INSERT INTO community_post_favorites (post_id, user_id)
            VALUES ($1, $2)
          `,
          [postId, user.id]
        );
      }

      await this.ensureCollectedImageRelation(client, {
        wordId: target.word_id,
        imageAssetId: Number(target.image_asset_id),
        user,
        sourceLabel: target.source_label || "社区收藏",
        sourceCredit: target.source_credit
      });

      await this.refreshPostReactionCounts(client, postId);

      return this.wordsService.getWordByIdForUser(target.word_id, user.id, client);
    });

    return {
      post: (await this.getPostDetail(postId, user.id)).post,
      word: updatedWord
    };
  }

  async incrementPostShare(postId: number): Promise<{ shareCount: number }> {
    const result = await this.database.transaction(async (client) => {
      await this.ensureActivePost(client, postId);
      await client.query(
        `
          UPDATE community_posts
          SET share_count = share_count + 1
          WHERE id = $1
        `,
        [postId]
      );

      const next = await client.query<{ share_count: number | string }>(
        `
          SELECT share_count
          FROM community_posts
          WHERE id = $1
          LIMIT 1
        `,
        [postId]
      );

      return Number(next.rows[0]?.share_count || 0);
    });

    return { shareCount: result };
  }

  async toggleCommentLike(commentId: number, userId: number): Promise<{ comment: CommunityComment }> {
    await this.database.transaction(async (client) => {
      const comment = await this.ensureActiveComment(client, commentId);
      const existing = await client.query<{ id: number | string }>(
        `
          SELECT id
          FROM community_comment_likes
          WHERE comment_id = $1
            AND user_id = $2
          LIMIT 1
        `,
        [commentId, userId]
      );

      if (existing.rows[0]) {
        await client.query(
          `
            DELETE FROM community_comment_likes
            WHERE comment_id = $1
              AND user_id = $2
          `,
          [commentId, userId]
        );
      } else {
        await client.query(
          `
            INSERT INTO community_comment_likes (comment_id, user_id)
            VALUES ($1, $2)
          `,
          [commentId, userId]
        );
      }

      await client.query(
        `
          UPDATE community_comments
          SET like_count = (
            SELECT COUNT(*)
            FROM community_comment_likes
            WHERE comment_id = $1
          )
          WHERE id = $1
        `,
        [comment.id]
      );
    });

    const comment = await this.getCommentDetail(commentId, userId);
    return { comment };
  }

  private async listComments(postId: number, userId: number): Promise<CommunityComment[]> {
    const result = await this.database.query<CommentRow>(
      `
        SELECT
          c.id AS comment_id,
          c.content,
          c.like_count,
          c.created_at,
          u.id AS user_id,
          u.email AS user_email,
          u.display_name AS user_display_name,
          u.avatar_url AS user_avatar_url,
          EXISTS (
            SELECT 1
            FROM community_comment_likes cl
            WHERE cl.comment_id = c.id
              AND cl.user_id = $2
          ) AS viewer_liked
        FROM community_comments c
        INNER JOIN users u
          ON u.id = c.user_id
        WHERE c.post_id = $1
          AND c.status = 'active'
        ORDER BY c.created_at ASC, c.id ASC
      `,
      [postId, userId]
    );

    return result.rows.map((row) => this.mapCommentRow(row));
  }

  private async getCommentDetail(commentId: number, userId: number): Promise<CommunityComment> {
    const result = await this.database.query<CommentRow>(
      `
        SELECT
          c.id AS comment_id,
          c.content,
          c.like_count,
          c.created_at,
          u.id AS user_id,
          u.email AS user_email,
          u.display_name AS user_display_name,
          u.avatar_url AS user_avatar_url,
          EXISTS (
            SELECT 1
            FROM community_comment_likes cl
            WHERE cl.comment_id = c.id
              AND cl.user_id = $2
          ) AS viewer_liked
        FROM community_comments c
        INNER JOIN users u
          ON u.id = c.user_id
        WHERE c.id = $1
          AND c.status = 'active'
        LIMIT 1
      `,
      [commentId, userId]
    );

    const row = result.rows[0];

    if (!row) {
      throw new NotFoundException("Comment not found.");
    }

    return this.mapCommentRow(row);
  }

  private async ensureActivePost(client: DatabaseClient, postId: number): Promise<void> {
    const result = await client.query<{ id: number | string }>(
      `
        SELECT id
        FROM community_posts
        WHERE id = $1
          AND status = 'active'
        LIMIT 1
      `,
      [postId]
    );

    if (!result.rows[0]) {
      throw new NotFoundException("Community post not found.");
    }
  }

  private async ensureActiveComment(client: DatabaseClient, commentId: number): Promise<{ id: number }> {
    const result = await client.query<{ id: number | string }>(
      `
        SELECT id
        FROM community_comments
        WHERE id = $1
          AND status = 'active'
        LIMIT 1
      `,
      [commentId]
    );

    const row = result.rows[0];

    if (!row) {
      throw new NotFoundException("Comment not found.");
    }

    return { id: Number(row.id) };
  }

  private async refreshPostReactionCounts(client: DatabaseClient, postId: number): Promise<void> {
    await client.query(
      `
        UPDATE community_posts
        SET
          like_count = (
            SELECT COUNT(*)
            FROM community_post_likes
            WHERE post_id = $1
          ),
          favorite_count = (
            SELECT COUNT(*)
            FROM community_post_favorites
            WHERE post_id = $1
          )
        WHERE id = $1
      `,
      [postId]
    );
  }

  private async getFavoriteTarget(
    client: DatabaseClient,
    postId: number
  ): Promise<FavoriteTargetRow | null> {
    const result = await client.query<FavoriteTargetRow>(
      `
        SELECT
          p.id AS post_id,
          p.user_id,
          p.word_id,
          wi.image_asset_id,
          wi.source_label,
          wi.source_credit
        FROM community_posts p
        INNER JOIN word_images wi
          ON wi.id = p.word_image_id
        WHERE p.id = $1
          AND p.status = 'active'
        LIMIT 1
      `,
      [postId]
    );

    return result.rows[0] || null;
  }

  private async ensureCollectedImageRelation(
    client: DatabaseClient,
    input: {
      wordId: string;
      imageAssetId: number;
      user: AuthenticatedUser;
      sourceLabel: string;
      sourceCredit: string | null;
    }
  ): Promise<void> {
    const existingRelationResult = await client.query<{ id: number | string }>(
      `
        SELECT id
        FROM word_images
        WHERE word_id = $1
          AND image_asset_id = $2
          AND scope = 'private'
          AND owner_user_id = $3
          AND status = 'active'
        LIMIT 1
      `,
      [input.wordId, input.imageAssetId, input.user.id]
    );

    if (existingRelationResult.rows[0]) {
      return;
    }

    const nextSortOrderResult = await client.query<{ next_sort_order: number | string }>(
      `
        SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order
        FROM word_images
        WHERE word_id = $1
          AND scope = 'private'
          AND owner_user_id = $2
          AND status = 'active'
      `,
      [input.wordId, input.user.id]
    );

    const nextSortOrder = Number(nextSortOrderResult.rows[0]?.next_sort_order || 1);
    const normalizedSourceLabel = normalizeCollectedImageSourceLabel(input.sourceLabel);

    await client.query(
      `
        INSERT INTO word_images (
          word_id,
          image_asset_id,
          scope,
          owner_user_id,
          source_label,
          source_credit,
          status,
          sort_order,
          created_by_user_id
        )
        VALUES ($1, $2, 'private', $3, $4, $5, 'active', $6, $3)
      `,
      [
        input.wordId,
        input.imageAssetId,
        input.user.id,
        normalizedSourceLabel,
        input.sourceCredit,
        nextSortOrder
      ]
    );
  }

  private async getPublishableImage(
    client: DatabaseClient,
    wordImageId: number
  ): Promise<PublishImageRow | null> {
    const result = await client.query<PublishImageRow>(
      `
        SELECT
          wi.word_id,
          wi.id AS image_id,
          wi.scope,
          wi.owner_user_id,
          ia.storage_type AS image_storage_type,
          ia.storage_key AS image_storage_key,
          ia.public_url AS image_public_url
        FROM word_images wi
        INNER JOIN image_assets ia
          ON ia.id = wi.image_asset_id
        WHERE wi.id = $1
          AND wi.status = 'active'
        LIMIT 1
      `,
      [wordImageId]
    );

    return result.rows[0] || null;
  }

  private assertAdmin(user: AuthenticatedUser): void {
    if (user.isAdmin) {
      return;
    }

    throw new ForbiddenException("Admin access is required.");
  }

  private mapFeedRow(row: FeedRow): CommunityFeedPost {
    return {
      id: Number(row.post_id),
      wordId: row.word_id,
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
      author: {
        id: Number(row.user_id),
        displayName: row.user_display_name,
        email: row.user_email,
        avatarText: buildAvatarText(row.user_display_name || row.user_email),
        avatarUrl: row.user_avatar_url
      },
      viewer: {
        liked: Boolean(Number(row.viewer_liked || 0)),
        favorited: Boolean(Number(row.viewer_favorited || 0))
      }
    };
  }

  private mapAdminPostRow(row: AdminPostRow): CommunityAdminPost {
    return {
      id: Number(row.post_id),
      wordId: row.word_id,
      title: row.title,
      body: row.body,
      imageUrl: this.storage.resolvePublicUrl({
        storageType: row.image_storage_type,
        storageKey: row.image_storage_key,
        publicUrl: row.image_public_url
      }),
      status: row.status,
      likeCount: Number(row.like_count || 0),
      favoriteCount: Number(row.favorite_count || 0),
      commentCount: Number(row.comment_count || 0),
      shareCount: Number(row.share_count || 0),
      createdAt: toIsoString(row.created_at),
      author: {
        id: Number(row.user_id),
        displayName: row.user_display_name,
        email: row.user_email,
        avatarText: buildAvatarText(row.user_display_name || row.user_email),
        avatarUrl: row.user_avatar_url
      }
    };
  }

  private mapCommentRow(row: CommentRow): CommunityComment {
    return {
      id: Number(row.comment_id),
      content: row.content,
      likeCount: Number(row.like_count || 0),
      createdAt: toIsoString(row.created_at),
      author: {
        id: Number(row.user_id),
        displayName: row.user_display_name,
        email: row.user_email,
        avatarText: buildAvatarText(row.user_display_name || row.user_email),
        avatarUrl: row.user_avatar_url
      },
      viewer: {
        liked: Boolean(Number(row.viewer_liked || 0))
      }
    };
  }
}

function buildAvatarText(value: string): string {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return "U";
  }

  return normalizedValue.slice(0, 2).toUpperCase();
}

function normalizeCollectedImageSourceLabel(value: string): string {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue || normalizedValue === "绀惧尯鏀惰棌") {
    return "社区收藏";
  }

  return normalizedValue;
}

function toIsoString(value: Date | string): string {
  return new Date(value).toISOString();
}
