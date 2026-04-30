import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { DatabaseClient } from "../database/mysql";
import { StorageService } from "../storage/storage.service";
import {
  LearningDeckBook,
  LearningDeckImage,
  LearningDeckResponse,
  LearningDeckWord
} from "./words.types";

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
  image_scope: "default" | "private" | null;
  image_owner_user_id: number | string | null;
  image_storage_type: string | null;
  image_storage_key: string | null;
  image_public_url: string | null;
  image_source_label: string | null;
  image_source_credit: string | null;
  image_sort_order: number | null;
}

interface BookSummaryRow {
  code: string;
  name: string;
  word_count: number | string;
  sort_order: number | string;
}

@Injectable()
export class WordsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly storage: StorageService
  ) {}

  async getLearningDeckForUser(
    userId: number,
    requestedBookCode?: string
  ): Promise<LearningDeckResponse> {
    const books = await this.listBooks();

    if (books.length === 0) {
      return {
        books: [],
        activeBookCode: null,
        words: []
      };
    }

    const activeBook =
      books.find((book) => book.code === normalizeBookCode(requestedBookCode)) || books[0];
    const rows = await this.fetchDeckRowsForBook(userId, activeBook.code);

    return {
      books,
      activeBookCode: activeBook.code,
      words: this.mapDeckRows(rows)
    };
  }

  async getWordByIdForUser(
    wordId: string,
    userId: number,
    client?: DatabaseClient
  ): Promise<LearningDeckWord | null> {
    const rows = await this.fetchWordRowsById(wordId, userId, client);
    const words = this.mapDeckRows(rows);
    return words[0] || null;
  }

  async hasWord(wordId: string, client?: DatabaseClient): Promise<boolean> {
    const result = client
      ? await client.query<{ id: string }>(
          `
            SELECT id
            FROM words
            WHERE id = $1
            LIMIT 1
          `,
          [wordId]
        )
      : await this.database.query<{ id: string }>(
          `
            SELECT id
            FROM words
            WHERE id = $1
            LIMIT 1
          `,
          [wordId]
        );

    return result.rows.length > 0;
  }

  private async listBooks(): Promise<LearningDeckBook[]> {
    const result = await this.database.query<BookSummaryRow>(
      `
        SELECT
          b.code,
          b.name,
          b.sort_order,
          COUNT(bw.id) AS word_count
        FROM books b
        LEFT JOIN book_words bw
          ON bw.book_id = b.id
        GROUP BY b.id, b.code, b.name, b.sort_order
        ORDER BY b.sort_order ASC, b.id ASC
      `
    );

    return result.rows.map((row) => ({
      code: row.code,
      name: row.name,
      wordCount: Number(row.word_count || 0)
    }));
  }

  private async fetchDeckRowsForBook(userId: number, bookCode: string): Promise<DeckRow[]> {
    const result = await this.database.query<DeckRow>(
      `
        SELECT
          w.id AS word_id,
          COALESCE(bw.sort_order, w.sort_order) AS word_sort_order,
          w.english,
          w.chinese,
          w.level,
          w.theme,
          w.example_text,
          w.example_translation,
          w.image_reason,
          w.scene,
          CAST(wi.id AS CHAR) AS image_id,
          wi.scope AS image_scope,
          CAST(wi.owner_user_id AS CHAR) AS image_owner_user_id,
          ia.storage_type AS image_storage_type,
          ia.storage_key AS image_storage_key,
          ia.public_url AS image_public_url,
          wi.source_label AS image_source_label,
          wi.source_credit AS image_source_credit,
          wi.sort_order AS image_sort_order
        FROM book_words bw
        INNER JOIN books b
          ON b.id = bw.book_id
        INNER JOIN words w
          ON w.id = bw.word_id
        LEFT JOIN word_images wi
          ON wi.word_id = w.id
         AND wi.status = 'active'
         AND (
              (
                wi.scope = 'default'
                AND NOT EXISTS (
                  SELECT 1
                  FROM user_hidden_word_images uhwi
                  WHERE uhwi.user_id = $1
                    AND uhwi.word_image_id = wi.id
                )
              )
              OR (
                wi.scope = 'private'
                AND wi.owner_user_id = $1
              )
            )
        LEFT JOIN image_assets ia
          ON ia.id = wi.image_asset_id
        WHERE b.code = $2
        ORDER BY
          COALESCE(bw.sort_order, w.sort_order) ASC,
          CASE
            WHEN wi.scope = 'default' THEN 0
            WHEN wi.scope = 'private' THEN 1
            ELSE 2
          END ASC,
          wi.sort_order ASC,
          wi.id ASC
      `,
      [userId, bookCode]
    );

    return result.rows;
  }

  private async fetchWordRowsById(
    wordId: string,
    userId: number,
    client?: DatabaseClient
  ): Promise<DeckRow[]> {
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
        CAST(wi.id AS CHAR) AS image_id,
        wi.scope AS image_scope,
        CAST(wi.owner_user_id AS CHAR) AS image_owner_user_id,
        ia.storage_type AS image_storage_type,
        ia.storage_key AS image_storage_key,
        ia.public_url AS image_public_url,
        wi.source_label AS image_source_label,
        wi.source_credit AS image_source_credit,
        wi.sort_order AS image_sort_order
      FROM words w
      LEFT JOIN word_images wi
        ON wi.word_id = w.id
       AND wi.status = 'active'
       AND (
            (
              wi.scope = 'default'
              AND NOT EXISTS (
                SELECT 1
                FROM user_hidden_word_images uhwi
                WHERE uhwi.user_id = $1
                  AND uhwi.word_image_id = wi.id
              )
            )
            OR (
              wi.scope = 'private'
              AND wi.owner_user_id = $1
            )
          )
      LEFT JOIN image_assets ia
        ON ia.id = wi.image_asset_id
      WHERE w.id = $2
      ORDER BY
        w.sort_order ASC,
        CASE
          WHEN wi.scope = 'default' THEN 0
          WHEN wi.scope = 'private' THEN 1
          ELSE 2
        END ASC,
        wi.sort_order ASC,
        wi.id ASC
    `;

    const result = client
      ? await client.query<DeckRow>(query, [userId, wordId])
      : await this.database.query<DeckRow>(query, [userId, wordId]);

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
          sortOrder: row.image_sort_order || 0,
          scope: row.image_scope || "default",
          ownerUserId:
            row.image_owner_user_id === null || row.image_owner_user_id === undefined
              ? null
              : Number(row.image_owner_user_id)
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

function normalizeBookCode(value?: string): string {
  return String(value || "").trim().toLowerCase();
}
