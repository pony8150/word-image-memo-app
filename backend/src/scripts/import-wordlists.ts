import { readFile, readdir } from "node:fs/promises";
import * as path from "node:path";
import { getRequiredDatabaseUrl } from "../config/env";
import { createDatabasePool, executeQuery } from "../database/mysql";

interface WordlistSourceDefinition {
  code: string;
  name: string;
  level: string;
  filePattern: RegExp;
}

interface ParsedWordlistEntry {
  index: number;
  word: string;
  meaning: string;
  page: string | null;
}

interface LooseWordlistRecord {
  index: number;
  word: string;
  meaning: string;
  page: string | null;
}

const WORDLIST_DIRECTORY = path.resolve(process.cwd(), "..", "data", "wordlists");

const WORDLIST_SOURCES: WordlistSourceDefinition[] = [
  {
    code: "junior-high",
    name: "初中词汇",
    level: "junior-high",
    filePattern: /^初中词汇\.json$/u
  },
  {
    code: "senior-high",
    name: "高中词汇",
    level: "senior-high",
    filePattern: /^高中词汇\.json$/u
  },
  {
    code: "postgraduate-redbook",
    name: "红宝书考研词汇",
    level: "postgraduate",
    filePattern: /^红宝书-考研词汇\.json$/u
  }
];

const LEGACY_DEMO_BOOK_CODES_TO_REMOVE = new Set(["college"]);

async function main() {
  const pool = createDatabasePool(getRequiredDatabaseUrl());

  try {
    const fileNames = await readdir(WORDLIST_DIRECTORY);

    for (const source of WORDLIST_SOURCES) {
      const fileName = resolveWordlistFileName(fileNames, source);

      if (!fileName) {
        throw new Error(`Missing wordlist file for ${source.code} in ${WORDLIST_DIRECTORY}`);
      }

      const filePath = path.resolve(WORDLIST_DIRECTORY, fileName);
      const fileContent = await readFile(filePath, "utf8");
      const parsedEntries = parseLooseWordlist(fileContent);
      const normalizedEntries = dedupeWordlistEntries(parsedEntries);
      const bookId = await ensureBook(pool, source);

      await executeQuery(pool, "DELETE FROM book_words WHERE book_id = $1", [bookId]);

      let importedWordCount = 0;

      for (const entry of normalizedEntries) {
        const wordId = buildWordId(entry.word);

        if (!wordId) {
          continue;
        }

        await upsertWord(pool, {
          id: wordId,
          english: normalizeDisplayWord(entry.word),
          chinese: normalizeMeaning(entry.meaning),
          level: source.level,
          theme: entry.page
        });

        await executeQuery(
          pool,
          `
            INSERT INTO book_words (
              book_id,
              word_id,
              sort_order
            )
            VALUES ($1, $2, $3)
            ON DUPLICATE KEY UPDATE
              sort_order = VALUES(sort_order)
          `,
          [bookId, wordId, entry.index || importedWordCount + 1]
        );

        importedWordCount += 1;
      }

      console.log(
        `Imported ${importedWordCount} words into book "${source.code}" from ${fileName}.`
      );
    }

    for (const legacyBookCode of LEGACY_DEMO_BOOK_CODES_TO_REMOVE) {
      await executeQuery(
        pool,
        `
          DELETE FROM books
          WHERE code = $1
        `,
        [legacyBookCode]
      );
    }

    console.log("Wordlist import completed.");
  } finally {
    await pool.end();
  }
}

function resolveWordlistFileName(
  fileNames: string[],
  source: WordlistSourceDefinition
): string | null {
  return fileNames.find((fileName) => source.filePattern.test(fileName)) || null;
}

function parseLooseWordlist(fileContent: string): ParsedWordlistEntry[] {
  const lines = fileContent.replace(/^\uFEFF/, "").split(/\r?\n/);
  const entries: ParsedWordlistEntry[] = [];
  let currentRecord: LooseWordlistRecord | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (line.startsWith("{")) {
      currentRecord = {
        index: 0,
        word: "",
        meaning: "",
        page: null
      };
      continue;
    }

    if (!currentRecord) {
      continue;
    }

    if (line.startsWith("\"page\"")) {
      currentRecord.page = parseLooseStringField(line);
      continue;
    }

    if (line.startsWith("\"index\"")) {
      currentRecord.index = parseLooseNumberField(line);
      continue;
    }

    if (line.startsWith("\"word\"")) {
      currentRecord.word = parseLooseStringField(line);
      continue;
    }

    if (line.startsWith("\"meaning\"")) {
      currentRecord.meaning = parseLooseStringField(line);
      continue;
    }

    if (line.startsWith("}")) {
      if (currentRecord.word) {
        entries.push({
          index: currentRecord.index,
          word: currentRecord.word,
          meaning: currentRecord.meaning,
          page: currentRecord.page
        });
      }

      currentRecord = null;
    }
  }

  return entries;
}

function parseLooseStringField(line: string): string {
  const separatorIndex = line.indexOf(":");

  if (separatorIndex < 0) {
    return "";
  }

  let value = line.slice(separatorIndex + 1).trim();

  if (value.endsWith(",")) {
    value = value.slice(0, -1).trim();
  }

  if (value.startsWith("\"")) {
    value = value.slice(1);
  }

  if (value.endsWith("\"")) {
    value = value.slice(0, -1);
  }

  return value.replace(/\\"/g, "\"").replace(/\s+/g, " ").trim();
}

function parseLooseNumberField(line: string): number {
  const separatorIndex = line.indexOf(":");

  if (separatorIndex < 0) {
    return 0;
  }

  const numericText = line
    .slice(separatorIndex + 1)
    .replace(/,/g, "")
    .trim();
  const parsedNumber = Number(numericText);

  return Number.isFinite(parsedNumber) ? parsedNumber : 0;
}

function dedupeWordlistEntries(entries: ParsedWordlistEntry[]): ParsedWordlistEntry[] {
  const entriesById = new Map<string, ParsedWordlistEntry>();

  for (const entry of entries) {
    const wordId = buildWordId(entry.word);

    if (!wordId) {
      continue;
    }

    const existingEntry = entriesById.get(wordId);

    if (!existingEntry) {
      entriesById.set(wordId, entry);
      continue;
    }

    if (normalizeMeaning(entry.meaning).length > normalizeMeaning(existingEntry.meaning).length) {
      entriesById.set(wordId, entry);
    }
  }

  return [...entriesById.values()].sort((left, right) => left.index - right.index);
}

function buildWordId(word: string): string {
  const normalized = String(word || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’]/g, "'")
    .toLowerCase()
    .trim();

  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeDisplayWord(word: string): string {
  return String(word || "").replace(/\s+/g, " ").trim();
}

function normalizeMeaning(meaning: string): string {
  return String(meaning || "").replace(/\s+/g, " ").trim();
}

async function ensureBook(
  pool: ReturnType<typeof createDatabasePool>,
  source: WordlistSourceDefinition
): Promise<number> {
  await executeQuery(
    pool,
    `
      INSERT INTO books (
        code,
        name,
        sort_order
      )
      VALUES ($1, $2, $3)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        sort_order = VALUES(sort_order),
        updated_at = NOW()
    `,
    [source.code, source.name, resolveBookSortOrder(source.code)]
  );

  const bookResult = await executeQuery<{ id: number | string }>(
    pool,
    `
      SELECT id
      FROM books
      WHERE code = $1
      LIMIT 1
    `,
    [source.code]
  );

  return Number(bookResult.rows[0].id);
}

async function upsertWord(
  pool: ReturnType<typeof createDatabasePool>,
  input: {
    id: string;
    english: string;
    chinese: string;
    level: string;
    theme: string | null;
  }
): Promise<void> {
  await executeQuery(
    pool,
    `
      INSERT INTO words (
        id,
        sort_order,
        english,
        chinese,
        level,
        theme,
        example_text,
        example_translation,
        image_reason,
        scene
      )
      VALUES ($1, 0, $2, $3, $4, $5, NULL, NULL, NULL, NULL)
      ON DUPLICATE KEY UPDATE
        english = IF(words.english IS NULL OR words.english = '', VALUES(english), words.english),
        chinese = IF(words.chinese IS NULL OR words.chinese = '', VALUES(chinese), words.chinese),
        level = IF(words.level IS NULL OR words.level = '', VALUES(level), words.level),
        theme = IF(words.theme IS NULL OR words.theme = '', VALUES(theme), words.theme),
        updated_at = NOW()
    `,
    [input.id, input.english, input.chinese, input.level, input.theme]
  );
}

function resolveBookSortOrder(bookCode: string): number {
  switch (bookCode) {
    case "junior-high":
      return 1;
    case "senior-high":
      return 2;
    case "postgraduate-redbook":
      return 3;
    default:
      return 99;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
