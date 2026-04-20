import { Injectable } from "@nestjs/common";
import { PoolClient } from "pg";
import { DatabaseService } from "../database/database.service";
import { StorageService } from "../storage/storage.service";
import { LearningDeckImage, LearningDeckWord } from "./words.types";

interface DeckRow {
  word_id: string;
  word_sort_order: number;
  english: string;
  chinese: string;
  level: string | null;
  theme: string | null;
  example_text: string | null;
  example_translation: string | null;
  image_reason: string | null;
  scene: string | null;
  image_id: string | null;
  image_storage_type: string | null;
  image_storage_key: string | null;
  image_public_url: string | null;
  image_source_label: string | null;
  image_source_credit: string | null;
  image_sort_order: number | null;
}

@Injectable()
export class WordsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly storage: StorageService
  ) {}

  async getLearningDeck(): Promise<{ words: LearningDeckWord[] }> {
    const rows = await this.fetchDeckRows();
    return { words: this.mapDeckRows(rows) };
  }

  async getWordById(wordId: string, client?: PoolClient): Promise<LearningDeckWord | null> {
    const rows = await this.fetchDeckRows(client, wordId);
    const words = this.mapDeckRows(rows);
    return words[0] || null;
  }

  private async fetchDeckRows(client?: PoolClient, wordId?: string): Promise<DeckRow[]> {
    const params: unknown[] = [];
    let whereClause = "";

    if (wordId) {
      params.push(wordId);
      whereClause = "WHERE w.id = $1";
    }

    const query = `
        SELECT
          w.id AS word_id,
          w.sort_order AS word_sort_order,
          w.english,
          w.chinese,
          w.level,
          w.theme,
          w.example_text,
          w.example_translation,
          w.image_reason,
          w.scene,
          wi.id::text AS image_id,
          wi.storage_type AS image_storage_type,
          wi.storage_key AS image_storage_key,
          wi.public_url AS image_public_url,
          wi.source_label AS image_source_label,
          wi.source_credit AS image_source_credit,
          wi.sort_order AS image_sort_order
        FROM words w
        LEFT JOIN word_images wi
          ON wi.word_id = w.id
         AND wi.status = 'active'
        ${whereClause}
        ORDER BY w.sort_order ASC, wi.sort_order ASC, wi.id ASC
      `;

    const result = client
      ? await client.query<DeckRow>(query, params)
      : await this.database.query<DeckRow>(
          query,
          params
        );

    return result.rows;
  }

  private mapDeckRows(rows: DeckRow[]): LearningDeckWord[] {
    const wordsById = new Map<string, LearningDeckWord>();

    rows.forEach((row) => {
      if (!wordsById.has(row.word_id)) {
        wordsById.set(row.word_id, {
          id: row.word_id,
          english: row.english,
          chinese: row.chinese,
          level: row.level,
          theme: row.theme,
          example: row.example_text,
          exampleChinese: row.example_translation,
          imageReason: row.image_reason,
          scene: row.scene,
          image: "",
          imageSource: null,
          imageCredit: null,
          images: []
        });
      }

      const word = wordsById.get(row.word_id)!;

      if (row.image_id && row.image_storage_type) {
        const image: LearningDeckImage = {
          id: Number(row.image_id),
          url: this.storage.resolvePublicUrl({
            storageType: row.image_storage_type,
            storageKey: row.image_storage_key,
            publicUrl: row.image_public_url
          }),
          source: row.image_source_label || "Image",
          credit: row.image_source_credit,
          storageType: row.image_storage_type,
          storageKey: row.image_storage_key,
          sortOrder: row.image_sort_order || 0
        };

        word.images.push(image);
      }
    });

    return [...wordsById.values()].map((word) => {
      const firstImage = word.images[0];
      return {
        ...word,
        image: firstImage?.url || "",
        imageSource: firstImage?.source || null,
        imageCredit: firstImage?.credit || null
      };
    });
  }
}
