import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DatabaseService } from "../database/database.service";
import { DatabaseClient } from "../database/mysql";
import { StorageService } from "../storage/storage.service";

interface DueImageRow {
  id: string;
  word_id: string;
  storage_type: string;
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
        SELECT CAST(id AS CHAR) AS id, word_id, storage_type, storage_key
        FROM word_images
        WHERE status = 'deleted'
          AND purge_after_at IS NOT NULL
          AND purge_after_at <= NOW()
        ORDER BY purge_after_at ASC
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

        if (lockedRow.storage_type === "local" && lockedRow.storage_key) {
          const referenceCountResult = await client.query<{ count: number | string }>(
            `
              SELECT COUNT(*) AS count
              FROM word_images
              WHERE storage_key = $1
                AND id <> $2
            `,
            [lockedRow.storage_key, Number(lockedRow.id)]
          );

          if (Number(referenceCountResult.rows[0]?.count || "0") === 0) {
            await this.storage.deleteLocalFile(lockedRow.storage_key);
          }
        }

        await client.query(
          `
            INSERT INTO image_operation_logs (word_image_id, word_id, action, actor_type, note)
            VALUES ($1, $2, 'purge', 'system', 'auto purge after retention window')
          `,
          [Number(lockedRow.id), lockedRow.word_id]
        );

        await client.query("DELETE FROM word_images WHERE id = $1", [Number(lockedRow.id)]);
        purgedCount += 1;
      });
    }

    if (purgedCount > 0) {
      this.logger.log(`Purged ${purgedCount} deleted image record(s).`);
    }

    return purgedCount;
  }

  private async lockImageRow(client: DatabaseClient, imageId: number): Promise<DueImageRow | null> {
    const result = await client.query<DueImageRow>(
      `
        SELECT CAST(id AS CHAR) AS id, word_id, storage_type, storage_key
        FROM word_images
        WHERE id = $1
          AND status = 'deleted'
          AND purge_after_at IS NOT NULL
          AND purge_after_at <= NOW()
        FOR UPDATE
      `,
      [imageId]
    );

    return result.rows[0] || null;
  }
}
