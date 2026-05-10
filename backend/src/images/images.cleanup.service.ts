import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DatabaseService } from "../database/database.service";
import { DatabaseClient } from "../database/mysql";
import { StorageService } from "../storage/storage.service";

interface DueImageRow {
  id: string;
  word_id: string;
  image_asset_id: string;
  storage_type: string | null;
  storage_key: string | null;
}

@Injectable()
export class ImagesCleanupService {
  private readonly logger = new Logger(ImagesCleanupService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly storage: StorageService
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyCleanup(): Promise<void> {
    await this.purgeDueImages();
  }

  async purgeDueImages(): Promise<number> {
    const dueImagesResult = await this.database.query<DueImageRow>(
      `
        SELECT
          CAST(wi.id AS CHAR) AS id,
          wi.word_id,
          CAST(wi.image_asset_id AS CHAR) AS image_asset_id,
          ia.storage_type,
          ia.storage_key
        FROM word_images wi
        LEFT JOIN image_assets ia
          ON ia.id = wi.image_asset_id
        WHERE wi.status = 'deleted'
          AND wi.purge_after_at IS NOT NULL
          AND wi.purge_after_at <= NOW()
        ORDER BY wi.purge_after_at ASC
        LIMIT 200
      `
    );

    let purgedCount = 0;

    for (const row of dueImagesResult.rows) {
      await this.database.transaction(async (client) => {
        const lockedRow = await this.lockImageRow(client, Number(row.id));

        if (!lockedRow) {
          return;
        }

        const assetReferenceCountResult = await client.query<{ count: number | string }>(
          `
            SELECT SUM(reference_count) AS count
            FROM (
              SELECT COUNT(*) AS reference_count
              FROM word_images
              WHERE image_asset_id = $1
                AND id <> $2

              UNION ALL

              SELECT COUNT(*) AS reference_count
              FROM community_posts
              WHERE word_image_id = $2
                AND status = 'active'
            ) references_union
          `,
          [Number(lockedRow.image_asset_id), Number(lockedRow.id)]
        );

        const hasOtherReferences = Number(assetReferenceCountResult.rows[0]?.count || "0") > 0;

        if (!hasOtherReferences) {
          if (lockedRow.storage_type === "local" && lockedRow.storage_key) {
            await this.storage.deleteLocalFile(lockedRow.storage_key);
          }

          await client.query(
            `
              DELETE FROM image_assets
              WHERE id = $1
            `,
            [Number(lockedRow.image_asset_id)]
          );
        }

        await client.query(
          `
            INSERT INTO image_operation_logs (word_image_id, word_id, action, actor_type, note)
            VALUES ($1, $2, 'purge', 'system', 'auto purge after retention window')
          `,
          [Number(lockedRow.id), lockedRow.word_id]
        );

        await client.query(
          `
            DELETE FROM word_images
            WHERE id = $1
          `,
          [Number(lockedRow.id)]
        );

        purgedCount += 1;
      });
    }

    if (purgedCount > 0) {
      this.logger.log(`Purged ${purgedCount} deleted private image record(s).`);
    }

    return purgedCount;
  }

  private async lockImageRow(client: DatabaseClient, imageId: number): Promise<DueImageRow | null> {
    const result = await client.query<DueImageRow>(
      `
        SELECT
          CAST(wi.id AS CHAR) AS id,
          wi.word_id,
          CAST(wi.image_asset_id AS CHAR) AS image_asset_id,
          ia.storage_type,
          ia.storage_key
        FROM word_images wi
        LEFT JOIN image_assets ia
          ON ia.id = wi.image_asset_id
        WHERE wi.id = $1
          AND wi.status = 'deleted'
          AND wi.purge_after_at IS NOT NULL
          AND wi.purge_after_at <= NOW()
        FOR UPDATE
      `,
      [imageId]
    );

    return result.rows[0] || null;
  }
}
