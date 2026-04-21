import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PoolClient } from "pg";
import { appEnv } from "../config/env";
import { DatabaseService } from "../database/database.service";
import { StorageService } from "../storage/storage.service";
import { WordsService } from "../words/words.service";

interface ImageTargetRow {
  id: string;
  word_id: string;
  status: "active" | "deleted";
}

interface UploadWordImageInput {
  storageKey: string;
  mimetype: string;
}

@Injectable()
export class ImagesService {
  constructor(
    private readonly database: DatabaseService,
    private readonly wordsService: WordsService,
    private readonly storage: StorageService
  ) {}

  async uploadImage(wordId: string, uploadedImage: UploadWordImageInput) {
    if (!uploadedImage.storageKey) {
      throw new BadRequestException("Upload storage key is missing.");
    }

    const existingWord = await this.wordsService.getWordById(wordId);

    if (!existingWord) {
      await this.safeDeleteLocalFile(uploadedImage.storageKey);
      throw new NotFoundException("Word not found.");
    }

    try {
      return await this.database.transaction(async (client) => {
        const nextSortOrderResult = await client.query<{ next_sort_order: number | string }>(
          `
            SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order
            FROM word_images
            WHERE word_id = $1
          `,
          [wordId]
        );

        const nextSortOrder = Number(nextSortOrderResult.rows[0]?.next_sort_order || 1);
        await client.query(
          `
            INSERT INTO word_images (
              word_id,
              storage_type,
              storage_key,
              public_url,
              source_label,
              source_credit,
              status,
              sort_order
            )
            VALUES ($1, 'local', $2, NULL, 'Manual Upload', NULL, 'active', $3)
          `,
          [wordId, uploadedImage.storageKey, nextSortOrder]
        );

        const word = await this.wordsService.getWordById(wordId, client);

        if (!word) {
          throw new NotFoundException("Word not found after upload.");
        }

        return { word };
      });
    } catch (error) {
      await this.safeDeleteLocalFile(uploadedImage.storageKey);
      throw error;
    }
  }

  async deleteImage(imageId: number) {
    return this.database.transaction(async (client) => {
      const target = await this.getImageTarget(client, imageId);

      if (!target) {
        throw new NotFoundException("Image record not found.");
      }

      if (target.status !== "active") {
        throw new ConflictException("Only active images can be deleted.");
      }

      const activeCountResult = await client.query<{ count: string }>(
        `
          SELECT COUNT(*)::text AS count
          FROM word_images
          WHERE word_id = $1
            AND status = 'active'
        `,
        [target.word_id]
      );

      if (Number(activeCountResult.rows[0]?.count || "0") <= 1) {
        throw new ConflictException("Each word must keep at least one active image.");
      }

      await client.query(
        `
          UPDATE word_images
          SET
            status = 'deleted',
            deleted_at = NOW(),
            purge_after_at = NOW() + make_interval(hours => $2::int),
            updated_at = NOW()
          WHERE id = $1
        `,
        [imageId, appEnv.imagePurgeRetentionHours]
      );

      await this.insertLog(client, imageId, target.word_id, "delete", "manual delete");
      const word = await this.wordsService.getWordById(target.word_id, client);

      if (!word) {
        throw new NotFoundException("Word not found after delete.");
      }

      return { word };
    });
  }

  async restoreImage(imageId: number) {
    return this.database.transaction(async (client) => {
      const target = await this.getImageTarget(client, imageId);

      if (!target) {
        throw new NotFoundException("Image record not found.");
      }

      if (target.status !== "deleted") {
        throw new ConflictException("Only deleted images can be restored.");
      }

      await client.query(
        `
          UPDATE word_images
          SET
            status = 'active',
            deleted_at = NULL,
            purge_after_at = NULL,
            updated_at = NOW()
          WHERE id = $1
        `,
        [imageId]
      );

      await this.insertLog(client, imageId, target.word_id, "restore", "manual restore");
      const word = await this.wordsService.getWordById(target.word_id, client);

      if (!word) {
        throw new NotFoundException("Word not found after restore.");
      }

      return { word };
    });
  }

  private async getImageTarget(client: PoolClient, imageId: number): Promise<ImageTargetRow | null> {
    const result = await client.query<ImageTargetRow>(
      `
        SELECT id::text, word_id, status
        FROM word_images
        WHERE id = $1
      `,
      [imageId]
    );

    return result.rows[0] || null;
  }

  private async insertLog(
    client: PoolClient,
    imageId: number,
    wordId: string,
    action: "delete" | "restore",
    note: string
  ): Promise<void> {
    await client.query(
      `
        INSERT INTO image_operation_logs (word_image_id, word_id, action, actor_type, note)
        VALUES ($1, $2, $3, 'admin', $4)
      `,
      [imageId, wordId, action, note]
    );
  }

  private async safeDeleteLocalFile(storageKey: string): Promise<void> {
    try {
      await this.storage.deleteLocalFile(storageKey);
    } catch (error) {
      return;
    }
  }
}
