import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { promisify } from "node:util";
import { getRequiredDatabaseUrl } from "../config/env";
import { createDatabasePool, executeQuery } from "../database/mysql";
import { StorageService } from "../storage/storage.service";
import { OpenverseImageResult, searchOpenverseImages } from "./openverse-search";

interface TargetWordRow {
  sort_order: number | string;
  id: string;
  english: string;
  chinese: string;
  level: string | null;
  theme: string | null;
  existing_word_image_id: number | string | null;
  existing_image_asset_id: number | string | null;
}

interface ImageAssetRow {
  id: number | string;
}

interface PersistedAsset {
  id: number;
  storageKey: string;
}

interface BestImageCandidate {
  result: OpenverseImageResult;
  score: number;
  query: string;
}

interface DirectReplacementSource {
  sourceLabel: string;
  sourceCredit: string;
  url: string;
}

interface DownloadedReplacement {
  sourceLabel: string;
  sourceCredit: string;
  sourceUrl: string;
  content: Buffer;
  mimeType: string;
}

const execFileAsync = promisify(execFile);

const DEFAULT_BOOK_CODE = "junior-high";
const SUPPORTED_BOOK_CODES = new Set(["junior-high", "senior-high", "postgraduate-redbook"]);
const BATCH_LIMIT = 10000;
const WORD_PROCESS_CONCURRENCY = 4;
const OPENVERSE_PAGE_SIZE = 12;
const REMOTE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const SOURCE_CREDIT_MAX_LENGTH = 255;
const HTML_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
let shouldUseCurlFallback = false;

const SPECIAL_SEARCH_QUERIES: Record<string, string[]> = {
  without: ["empty hand icon", "without symbol"],
  quick: ["speed icon", "running fast"],
  its: ["animal close up", "pet tail"],
  several: ["several pencils", "group of objects"],
  recent: ["recent calendar", "calendar today"],
  ten: ["number 10 icon", "ten objects"],
  blue: ["blue color", "blue sky"],
  dark: ["dark night", "dark room"],
  at: ["at symbol icon", "location pin icon"],
  if: ["question mark icon", "decision sign"],
  he: ["boy portrait", "man illustration"],
  direct: ["straight arrow icon", "direct route sign"],
  along: ["road along river", "path beside river"],
  we: ["friends together", "group selfie"],
  yours: ["gift for you", "pointing at camera"],
  theirs: ["group of people together", "family house"],
  modern: ["modern city skyline", "modern building"],
  huge: ["huge elephant", "large building"],
  tall: ["tall building", "tall tree"],
  rich: ["money wallet", "gold coins"],
  please: ["hands together request", "please sign"],
  business: ["business office", "office meeting"],
  already: ["completed check mark", "done icon"],
  her: ["woman portrait", "girl illustration"],
  they: ["group of people", "friends group"],
  you: ["person pointing at camera", "you gesture"],
  anyone: ["person silhouette icon", "crowd person"],
  as: ["equal sign icon", "comparison symbol"],
  his: ["man portrait", "boy illustration"],
  heavy: ["heavy box lifting", "weight icon"],
  not: ["no symbol icon", "cross mark icon"],
  enemy: ["angry rivals", "enemy soldiers illustration"],
  with: ["handshake together", "people together"],
  him: ["man portrait", "boy illustration"],
  also: ["plus sign icon", "additional item"],
  over: ["bridge over river", "arch over road"],
  either: ["two choices sign", "fork road choice"],
  ourselves: ["friends selfie", "group together"],
  once: ["number one icon", "clock once"],
  my: ["hand on chest", "self portrait"],
  but: ["contrast black white", "however concept"],
  out: ["exit door icon", "outside arrow"],
  against: ["against wall", "protest sign"],
  or: ["choice sign", "fork road"],
  duty: ["duty officer", "responsibility icon"],
  include: ["checklist items", "include plus sign"],
  immediately: ["alarm clock", "urgent icon"],
  then: ["next arrow icon", "timeline next"],
  there: ["location pin", "place marker"],
  me: ["hand on chest", "self portrait"],
  them: ["group of people", "friends group"],
  in: ["inside room", "inside box"],
  these: ["these objects", "pointing at items"],
  policy: ["policy document", "government paper"],
  so: ["result arrow icon", "therefore sign"],
  down: ["down arrow icon", "stairs down"],
  this: ["pointing finger object", "this item"],
  their: ["group of people", "family group"],
  silent: ["finger on lips", "silent room"],
  up: ["up arrow icon", "stairs up"],
  those: ["distant objects", "pointing far"],
  besides: ["beside each other", "two people together"],
  instead: ["replace arrows icon", "instead switch"],
  ours: ["our house", "friends together"],
  she: ["woman portrait", "girl illustration"],
  and: ["chain link icon", "connection symbol"],
  under: ["under table", "below bridge"],
  our: ["friends together", "family group"],
  the: ["single highlighted object", "spotlight on apple"],
  no: ["no symbol icon", "stop sign"],
  to: ["destination arrow icon", "go to sign"],
  such: ["example objects", "sample illustration"],
  on: ["power on icon", "object on table"],
  of: ["slice of cake", "part of whole"],
  about: ["speech bubble icon", "information icon"],
  ok: ["thumbs up icon", "ok hand sign"],
  enough: ["full plate food", "enough water glass"],
  it: ["toy object", "single object icon"],
  repeat: ["repeat icon", "loop arrows"],
  during: ["calendar schedule", "clock during event"],
  cd: ["compact disc", "cd icon"],
  century: ["old clock", "historical century"],
  by: ["side by side", "next to tree"],
  us: ["friends together", "group selfie"],
  i: ["person pointing to self", "self portrait"],
  into: ["doorway into room", "enter arrow"],
  that: ["pointing far object", "distant object"],
  recite: ["student speaking", "reading aloud"],
  nor: ["neither symbol", "no choice sign"],
  your: ["pointing at camera", "your gift"],
  insist: ["protest sign", "determined face"],
  for: ["gift for you", "support sign"],
  large: ["large elephant", "big building"],
  pretend: ["theater mask", "child pretending"],
  understand: ["light bulb idea", "student understanding"],
  have: ["holding object", "hands holding book"],
  tragedy: ["sad theater mask", "disaster scene"],
  later: ["clock later", "calendar later"],
  misleading: ["wrong direction sign", "misleading arrow"],
  thirteenth: ["number 13 icon", "thirteenth date calendar"],
  instance: ["example icon", "sample object"],
  comedy: ["comedy mask", "laughing theater mask"],
  outdoor: ["outdoor camping", "outdoor park"],
  from: ["departure arrow", "from place sign"],
  fourteenth: ["number 14 icon", "fourteenth date calendar"],
  nineteenth: ["number 19 icon", "nineteenth date calendar"],
  are: ["group of people", "people together"],
  anxious: ["worried person", "anxious face"],
  am: ["person silhouette", "self portrait"],
  do: ["doing homework", "task checklist"],
  is: ["single object exists", "one object"],
  will: ["future calendar", "promise hand"]
};

const QUERY_TOKEN_STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "of",
  "for",
  "to",
  "and",
  "or",
  "with",
  "without",
  "in",
  "on",
  "at",
  "by",
  "from",
  "into",
  "about",
  "over",
  "under",
  "up",
  "down",
  "out",
  "along",
  "besides",
  "instead",
  "during",
  "then",
  "there",
  "this",
  "that",
  "these",
  "those",
  "their",
  "theirs",
  "our",
  "ours",
  "your",
  "yours",
  "its",
  "his",
  "her",
  "them",
  "they",
  "him",
  "he",
  "she",
  "me",
  "my",
  "we",
  "you",
  "us",
  "if",
  "as",
  "not",
  "so",
  "am",
  "is",
  "are",
  "do",
  "have",
  "will",
  "icon",
  "illustration",
  "symbol",
  "sign",
  "concept",
  "photo",
  "image"
]);

const DIRECT_REPLACEMENTS: Record<string, DirectReplacementSource[]> = {
  rich: [featherIcon("dollar-sign", "Dollar sign icon")],
  also: [featherIcon("plus-circle", "Plus circle icon")],
  over: [featherIcon("corner-up-right", "Corner up right icon")],
  out: [featherIcon("log-out", "Log out icon")],
  then: [featherIcon("chevrons-right", "Chevrons right icon")],
  in: [featherIcon("log-in", "Log in icon")],
  so: [featherIcon("arrow-right-circle", "Arrow right circle icon")],
  down: [featherIcon("arrow-down-circle", "Arrow down circle icon")],
  up: [featherIcon("arrow-up-circle", "Arrow up circle icon")],
  besides: [featherIcon("columns", "Columns icon")],
  and: [featherIcon("link", "Link icon")],
  such: [featherIcon("tag", "Tag icon")],
  on: [featherIcon("toggle-right", "Toggle right icon")],
  of: [featherIcon("pie-chart", "Pie chart icon")],
  about: [featherIcon("info", "Info icon")],
  ok: [featherIcon("check-circle", "Check circle icon")],
  it: [featherIcon("box", "Box icon")],
  cd: [featherIcon("disc", "Disc icon")],
  recite: [featherIcon("mic", "Microphone icon")],
  insist: [featherIcon("alert-circle", "Alert circle icon")],
  pretend: [featherIcon("smile", "Smile icon")],
  have: [featherIcon("package", "Package icon")],
  thirteenth: [featherIcon("calendar", "Calendar icon")],
  comedy: [featherIcon("smile", "Smile icon")],
  outdoor: [featherIcon("sun", "Sun icon")],
  fourteenth: [featherIcon("calendar", "Calendar icon")],
  nineteenth: [featherIcon("calendar", "Calendar icon")]
};

async function main() {
  const bookCode = resolveBookCodeFromArgs();
  const pool = createDatabasePool(getRequiredDatabaseUrl());
  const storage = new StorageService();
  await storage.onModuleInit();

  let insertedCount = 0;
  let replacedCount = 0;
  let generatedCount = 0;
  let retainedGeneratedCount = 0;
  let curatedCount = 0;
  let openverseCount = 0;
  let openverseMissCount = 0;
  let queryFailureCount = 0;
  try {
    const words = await listTargetWords(pool, bookCode);

    if (words.length === 0) {
      console.log(`No missing or Generated default images need processing for "${bookCode}".`);
      return;
    }

    console.log(`Processing "${bookCode}" with ${words.length} word(s).`);

    let nextWordIndex = 0;
    const workers = Array.from({ length: Math.min(WORD_PROCESS_CONCURRENCY, words.length) }, async () => {
      while (true) {
        const currentIndex = nextWordIndex;
        nextWordIndex += 1;

        const word = words[currentIndex];

        if (!word) {
          return;
        }

        const hasExistingGenerated = Number(word.existing_word_image_id || 0) > 0;

        try {
          const searchQueries = buildSearchQueries(word);
          const replacement = await resolveReplacementForWord(word, searchQueries, {
            onQueryFailure: () => {
              queryFailureCount += 1;
            }
          });

          if (!replacement) {
            openverseMissCount += 1;
            console.log(`Skipped ${word.id} after no usable replacement`);
            continue;
          }

          const asset = await resolveOrCreateLocalAsset(
            storage,
            pool,
            replacement.content,
            replacement.mimeType,
            replacement.sourceUrl
          );

          if (replacement.sourceLabel === "Openverse") {
            openverseCount += 1;
          } else {
            curatedCount += 1;
          }

          if (hasExistingGenerated) {
            await replaceDefaultWordImage(storage, pool, {
              wordImageId: Number(word.existing_word_image_id),
              wordId: word.id,
              previousImageAssetId: toOptionalNumber(word.existing_image_asset_id),
              nextImageAssetId: asset.id,
              sourceLabel: replacement.sourceLabel,
              sourceCredit: replacement.sourceCredit
            });

            replacedCount += 1;
            console.log(`Replaced Generated fallback for ${word.id}`);
            continue;
          }

          await insertDefaultWordImage(pool, {
            wordId: word.id,
            imageAssetId: asset.id,
            sourceLabel: replacement.sourceLabel,
            sourceCredit: replacement.sourceCredit
          });

          insertedCount += 1;
          console.log(`Inserted ${replacement.sourceLabel} image for ${word.id}`);
        } catch (error) {
          console.warn(`Failed for ${word.id}: ${error instanceof Error ? error.message : String(error)}`);
          if (hasExistingGenerated) {
            retainedGeneratedCount += 1;
          }
        }
      }
    });

    await Promise.all(workers);

    console.log(
      `Finished "${bookCode}". Inserted ${insertedCount} default image(s), replaced ${replacedCount} Generated fallback(s), generated ${generatedCount} fallback card(s), kept ${retainedGeneratedCount} unresolved Generated fallback(s), curated replacements ${curatedCount}, Openverse replacements ${openverseCount}, replacement misses ${openverseMissCount}, query failures ${queryFailureCount}.`
    );
  } finally {
    await pool.end();
  }
}

async function listTargetWords(
  pool: ReturnType<typeof createDatabasePool>,
  bookCode: string
): Promise<TargetWordRow[]> {
  const result = await executeQuery<TargetWordRow>(
    pool,
    `
      SELECT
        bw.sort_order,
        w.id,
        w.english,
        w.chinese,
        w.level,
        w.theme,
        existing_default.id AS existing_word_image_id,
        existing_default.image_asset_id AS existing_image_asset_id
      FROM book_words bw
      INNER JOIN books b
        ON b.id = bw.book_id
      INNER JOIN words w
        ON w.id = bw.word_id
      LEFT JOIN (
        SELECT
          wi.word_id,
          MIN(CASE WHEN wi.source_label = 'Generated' THEN wi.id ELSE NULL END) AS generated_word_image_id,
          SUM(CASE WHEN wi.source_label = 'Generated' THEN 1 ELSE 0 END) AS generated_count,
          SUM(CASE WHEN wi.source_label <> 'Generated' OR wi.source_label IS NULL THEN 1 ELSE 0 END) AS nongenerated_count
        FROM word_images wi
        WHERE wi.scope = 'default'
          AND wi.status = 'active'
        GROUP BY wi.word_id
      ) existing_summary
        ON existing_summary.word_id = w.id
      LEFT JOIN word_images existing_default
        ON existing_default.id = existing_summary.generated_word_image_id
      WHERE b.code = $1
        AND (
          existing_summary.word_id IS NULL
          OR (
            existing_summary.generated_count > 0
            AND existing_summary.nongenerated_count = 0
          )
        )
      ORDER BY bw.sort_order ASC, bw.id ASC
      LIMIT ${BATCH_LIMIT}
    `,
    [bookCode]
  );

  return result.rows;
}

function resolveBookCodeFromArgs(): string {
  const requestedBookCode = String(process.argv[2] || DEFAULT_BOOK_CODE)
    .trim()
    .toLowerCase();

  if (!SUPPORTED_BOOK_CODES.has(requestedBookCode)) {
    throw new Error(
      `Unsupported book code "${requestedBookCode}". Supported values: ${Array.from(
        SUPPORTED_BOOK_CODES
      ).join(", ")}.`
    );
  }

  return requestedBookCode;
}

async function resolveReplacementForWord(
  word: TargetWordRow,
  searchQueries: string[],
  options: {
    onQueryFailure: () => void;
  }
): Promise<DownloadedReplacement | null> {
  const curatedSources = DIRECT_REPLACEMENTS[word.id] || [];

  for (const source of curatedSources) {
    try {
      const downloaded = await downloadBinaryImage(source.url);
      console.log(`Using curated replacement for ${word.id}: ${source.url}`);
      return {
        sourceLabel: source.sourceLabel,
        sourceCredit: source.sourceCredit,
        sourceUrl: source.url,
        content: downloaded.content,
        mimeType: downloaded.mimeType
      };
    } catch (error) {
      console.warn(
        `Curated replacement failed for ${word.id}: url="${source.url}" error="${
          error instanceof Error ? error.message : String(error)
        }"`
      );
    }
  }

  const candidates = await findOpenverseCandidates(word, searchQueries, options);

  for (const candidate of candidates) {
    const imageUrl = candidate.result.url;

    if (!imageUrl) {
      continue;
    }

    try {
      const downloaded = await downloadBinaryImage(imageUrl);
      console.log(
        `Using Openverse match for ${word.id}: score=${candidate.score} query="${candidate.query}" url="${imageUrl}"`
      );
      return {
        sourceLabel: "Openverse",
        sourceCredit: buildOpenverseSourceCredit(candidate.result),
        sourceUrl: imageUrl,
        content: downloaded.content,
        mimeType: downloaded.mimeType
      };
    } catch (error) {
      console.warn(
        `Openverse candidate download failed for ${word.id}: score=${candidate.score} query="${candidate.query}" url="${imageUrl}" error="${
          error instanceof Error ? error.message : String(error)
        }"`
      );
    }
  }

  return null;
}

async function findOpenverseCandidates(
  word: TargetWordRow,
  searchQueries: string[],
  options: {
    onQueryFailure: () => void;
  }
): Promise<BestImageCandidate[]> {
  const candidates: BestImageCandidate[] = [];
  const seenUrls = new Set<string>();
  const acceptedScore = minimumAcceptableScore(word);
  const earlyStopScore = Math.max(acceptedScore + 16, 30);

  for (const query of searchQueries) {
    try {
      const results = await searchOpenverseImages(query, OPENVERSE_PAGE_SIZE);
      const queryCandidates = collectOpenverseCandidates(results, word, query);

      for (const candidate of queryCandidates) {
        const url = candidate.result.url || "";

        if (!url || seenUrls.has(url)) {
          continue;
        }

        seenUrls.add(url);
        candidates.push(candidate);
      }

      const bestCandidate = candidates.reduce<BestImageCandidate | null>((best, current) => {
        if (!best || current.score > best.score) {
          return current;
        }

        return best;
      }, null);

      if (bestCandidate && bestCandidate.score >= earlyStopScore) {
        break;
      }
    } catch (error) {
      options.onQueryFailure();
      console.warn(
        `Openverse query failed for ${word.id} using "${query}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  return candidates
    .filter((candidate) => candidate.score >= acceptedScore)
    .sort((left, right) => right.score - left.score)
    .slice(0, 8);
}

function buildSearchQueries(word: TargetWordRow): string[] {
  const english = word.english.trim();
  const chinese = word.chinese || "";
  const lowerEnglish = english.toLowerCase();
  const queries = new Set<string>();
  const specialQueries = SPECIAL_SEARCH_QUERIES[lowerEnglish] || [];

  specialQueries.forEach((query) => {
    queries.add(query);
  });

  if (!shouldSkipRawEnglishQuery(lowerEnglish)) {
    queries.add(english);
    queries.add(`${english} illustration`);
    queries.add(`${english} icon`);
  }

  if (/地图/.test(chinese)) {
    queries.add(`${english} map`);
  }

  if (/颜色|蓝色|黑暗|深色/.test(chinese) || lowerEnglish === "blue" || lowerEnglish === "dark") {
    queries.add(`${english} color`);
  }

  if (/数字|第十|十三|十四|十九/.test(chinese) || isNumberLikeWord(lowerEnglish)) {
    queries.add(`${english} number`);
  }

  if (/动物|狗|猫|鸟|鱼|昆虫|尾巴/.test(chinese)) {
    queries.add(`${english} animal`);
  }

  if (/节日/.test(chinese)) {
    queries.add(`${english} festival`);
  }

  if (/商业|商店/.test(chinese)) {
    queries.add(`${english} business`);
    queries.add(`${english} office`);
  }

  if (/责任|政策|理解|坚持|假装|焦虑|悲剧|喜剧/.test(chinese)) {
    queries.add(`${english} concept illustration`);
  }

  if (/户外/.test(chinese)) {
    queries.add(`${english} outdoors`);
  }

  if (/请|礼貌/.test(chinese)) {
    queries.add(`${english} gesture`);
  }

  if (/立即|后来|重复|背诵/.test(chinese)) {
    queries.add(`${english} action icon`);
  }

  if (!specialQueries.length && word.theme && /Unit9|Unit13|Unit15|Unit22|Unit23/.test(word.theme)) {
    queries.add(`${english} illustration`);
  }

  if (!specialQueries.length) {
    queries.add(`${english} concept`);
  }

  return Array.from(queries).filter((query) => query.trim().length > 0);
}

function shouldSkipRawEnglishQuery(lowerEnglish: string): boolean {
  const lettersOnly = lowerEnglish.replace(/[^a-z]/g, "");

  if (SPECIAL_SEARCH_QUERIES[lowerEnglish]) {
    return true;
  }

  return lettersOnly.length <= 2;
}

function isNumberLikeWord(lowerEnglish: string): boolean {
  return ["ten", "thirteenth", "fourteenth", "nineteenth"].includes(lowerEnglish);
}

function collectOpenverseCandidates(
  results: OpenverseImageResult[],
  word: TargetWordRow,
  query: string
): BestImageCandidate[] {
  return results
    .map((result) => ({
      result,
      score: scoreOpenverseResult(result, word, query),
      query
    }))
    .filter((candidate) => Boolean(candidate.result.url))
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);
}

function scoreOpenverseResult(result: OpenverseImageResult, word: TargetWordRow, query: string): number {
  if (!result.url || result.mature) {
    return -1000;
  }

  const title = (result.title || "").toLowerCase();
  const english = word.english.toLowerCase();
  const url = result.url.toLowerCase();
  const license = (result.license || "").toLowerCase();
  const source = (result.source || result.provider || "").toLowerCase();
  const filetype = (result.filetype || "").toLowerCase();
  const queryTokens = tokenizeQuery(query);
  let score = 0;

  if (english.length >= 4 && title.includes(english)) {
    score += 24;
  }

  const matchedTokenCount = queryTokens.filter((token) => title.includes(token) || url.includes(token)).length;
  score += matchedTokenCount * 10;

  if (queryTokens.length > 0 && matchedTokenCount === queryTokens.length) {
    score += 10;
  }

  if (source === "wikimedia" || source === "rawpixel") {
    score += 16;
  }

  if (source === "flickr" || source === "nasa") {
    score += 10;
  }

  if (license === "cc0") {
    score += 12;
  } else if (license.startsWith("by")) {
    score += 8;
  } else if (license.includes("nc") || license.includes("nd")) {
    score -= 6;
  }

  const width = Number(result.width || 0);
  const height = Number(result.height || 0);

  if ((width >= 400 && height >= 400) || filetype === "svg" || url.endsWith(".svg")) {
    score += 8;
  }

  if (width > 0 && height > 0 && (width < 180 || height < 180)) {
    score -= 12;
  }

  if (width > 2600 || height > 2600) {
    score -= 4;
  }

  if (filetype === "svg" || url.endsWith(".svg")) {
    score += 10;
  }

  if (/icon|illustration|clipart|sticker|vector|cartoon|symbol/.test(title)) {
    score += 8;
  }

  if (/map|chart|timeline|diagram|cover|poster|book cover|logo/.test(title)) {
    score -= 10;
  }

  if (/toy|museum|history|ancient|collection/.test(title) && matchedTokenCount === 0) {
    score -= 6;
  }

  if (isPronounLikeWord(english) && /portrait|people|person|man|woman|girl|boy|group|selfie/.test(title)) {
    score += 8;
  }

  if (isDirectionLikeWord(english) && /arrow|sign|symbol|marker|bridge|road|door/.test(title)) {
    score += 8;
  }

  if (isTimeLikeWord(english) && /clock|calendar|timeline|date/.test(title)) {
    score += 8;
  }

  if (isConceptLikeWord(english) && /icon|illustration|symbol|document|mask|gesture|sign/.test(title)) {
    score += 6;
  }

  return score;
}

function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 2 && !QUERY_TOKEN_STOP_WORDS.has(token));
}

function minimumAcceptableScore(word: TargetWordRow): number {
  const english = word.english.toLowerCase().trim();
  const lettersOnly = english.replace(/[^a-z]/g, "");

  if (SPECIAL_SEARCH_QUERIES[english] || lettersOnly.length <= 3) {
    return 0;
  }

  if (/pron\.|prep\.|conj\.|modal verb|art\./i.test(word.chinese || "")) {
    return 4;
  }

  return 14;
}

function isPronounLikeWord(english: string): boolean {
  return [
    "he",
    "she",
    "they",
    "them",
    "him",
    "her",
    "we",
    "us",
    "you",
    "your",
    "yours",
    "our",
    "ours",
    "ourselves",
    "their",
    "theirs",
    "my",
    "me",
    "i",
    "anyone",
    "its",
    "it"
  ].includes(english);
}

function isDirectionLikeWord(english: string): boolean {
  return [
    "at",
    "along",
    "over",
    "under",
    "out",
    "in",
    "up",
    "down",
    "to",
    "from",
    "into",
    "about",
    "by",
    "there",
    "this",
    "that",
    "those",
    "these",
    "direct"
  ].includes(english);
}

function isTimeLikeWord(english: string): boolean {
  return [
    "recent",
    "already",
    "immediately",
    "then",
    "once",
    "during",
    "later",
    "will",
    "thirteenth",
    "fourteenth",
    "nineteenth",
    "ten",
    "century"
  ].includes(english);
}

function isConceptLikeWord(english: string): boolean {
  return [
    "if",
    "as",
    "not",
    "also",
    "either",
    "but",
    "or",
    "duty",
    "policy",
    "so",
    "instead",
    "no",
    "ok",
    "enough",
    "repeat",
    "recite",
    "nor",
    "insist",
    "pretend",
    "understand",
    "tragedy",
    "misleading",
    "instance",
    "comedy",
    "anxious",
    "please"
  ].includes(english);
}

async function downloadBinaryImage(
  sourceUrl: string
): Promise<{ content: Buffer; mimeType: string }> {
  if (shouldUseCurlFallback) {
    return downloadBinaryImageViaCurl(sourceUrl);
  }

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "User-Agent": HTML_USER_AGENT
      },
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`Image ${sourceUrl} responded with ${response.status} ${response.statusText}.`);
    }

    const contentTypeHeader = (response.headers.get("content-type") || "")
      .split(";")[0]
      .trim()
      .toLowerCase();

    if (contentTypeHeader === "text/html") {
      throw new Error(`Image ${sourceUrl} returned HTML instead of an image.`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const content = Buffer.from(arrayBuffer);

    if (content.byteLength === 0) {
      throw new Error(`Image ${sourceUrl} downloaded as an empty file.`);
    }

    if (content.byteLength > REMOTE_IMAGE_MAX_BYTES) {
      throw new Error(`Image ${sourceUrl} exceeded ${REMOTE_IMAGE_MAX_BYTES} bytes after download.`);
    }

    const prefixText = content.slice(0, 256).toString("utf8").trimStart().toLowerCase();

    if (prefixText.startsWith("<!doctype html") || prefixText.startsWith("<html")) {
      throw new Error(`Image ${sourceUrl} returned HTML instead of an image.`);
    }

    return {
      content,
      mimeType: contentTypeHeader || detectMimeType(content, sourceUrl)
    };
  } catch (error) {
    if (!shouldFallbackToCurl(error)) {
      throw error;
    }

    shouldUseCurlFallback = true;
    return downloadBinaryImageViaCurl(sourceUrl);
  }
}

async function downloadBinaryImageViaCurl(
  sourceUrl: string
): Promise<{ content: Buffer; mimeType: string }> {
  const tempDirectoryPath = await mkdtemp(path.join(tmpdir(), "word-image-fill-"));
  const tempFilePath = path.join(tempDirectoryPath, "asset.bin");

  try {
    await execFileAsync(
      "curl.exe",
      [
        "-L",
        "--fail",
        "--silent",
        "--show-error",
        "--retry",
        "3",
        "--retry-all-errors",
        "--retry-delay",
        "1",
        "-A",
        HTML_USER_AGENT,
        "-H",
        "Accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "-o",
        tempFilePath,
        sourceUrl
      ],
      {
        timeout: 30000,
        maxBuffer: 1024 * 1024
      }
    );

    const content = await readFile(tempFilePath);

    if (content.byteLength === 0) {
      throw new Error(`Image ${sourceUrl} downloaded as an empty file.`);
    }

    if (content.byteLength > REMOTE_IMAGE_MAX_BYTES) {
      throw new Error(`Image ${sourceUrl} exceeded ${REMOTE_IMAGE_MAX_BYTES} bytes after download.`);
    }

    const prefixText = content.slice(0, 256).toString("utf8").trimStart().toLowerCase();

    if (prefixText.startsWith("<!doctype html") || prefixText.startsWith("<html")) {
      throw new Error(`Image ${sourceUrl} returned HTML instead of an image.`);
    }

    return {
      content,
      mimeType: detectMimeType(content, sourceUrl)
    };
  } finally {
    await rm(tempDirectoryPath, { recursive: true, force: true });
  }
}

function shouldFallbackToCurl(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /fetch failed|network|tls|certificate|socket/i.test(message);
}

async function insertDefaultWordImage(
  pool: ReturnType<typeof createDatabasePool>,
  input: {
    wordId: string;
    imageAssetId: number;
    sourceLabel: string;
    sourceCredit: string;
  }
): Promise<void> {
  const insertResult = await executeQuery(
    pool,
    `
      INSERT INTO word_images (
        word_id,
        image_asset_id,
        scope,
        owner_user_id,
        source_label,
        source_credit,
        status,
        sort_order
      )
      VALUES ($1, $2, 'default', NULL, $3, $4, 'active', 0)
    `,
    [input.wordId, input.imageAssetId, input.sourceLabel, truncateSourceCredit(input.sourceCredit)]
  );

  await executeQuery(
    pool,
    `
      INSERT INTO image_operation_logs (word_image_id, word_id, action, actor_type, note)
      VALUES ($1, $2, 'seed', 'system', $3)
    `,
    [insertResult.insertId, input.wordId, `filled default image using ${input.sourceLabel}`]
  );
}

async function replaceDefaultWordImage(
  storage: StorageService,
  pool: ReturnType<typeof createDatabasePool>,
  input: {
    wordImageId: number;
    wordId: string;
    previousImageAssetId: number | null;
    nextImageAssetId: number;
    sourceLabel: string;
    sourceCredit: string;
  }
): Promise<void> {
  await executeQuery(
    pool,
    `
      UPDATE word_images
      SET image_asset_id = $1,
          source_label = $2,
          source_credit = $3
      WHERE id = $4
    `,
    [input.nextImageAssetId, input.sourceLabel, truncateSourceCredit(input.sourceCredit), input.wordImageId]
  );

  await executeQuery(
    pool,
    `
      INSERT INTO image_operation_logs (word_image_id, word_id, action, actor_type, note)
      VALUES ($1, $2, 'seed', 'system', $3)
    `,
    [input.wordImageId, input.wordId, `replaced Generated fallback using ${input.sourceLabel}`]
  );

  if (input.previousImageAssetId && input.previousImageAssetId !== input.nextImageAssetId) {
    await cleanupUnusedAsset(storage, pool, input.previousImageAssetId);
  }
}

async function resolveOrCreateLocalAsset(
  storage: StorageService,
  pool: ReturnType<typeof createDatabasePool>,
  content: Buffer,
  mimeType: string,
  sourceUrl: string
): Promise<PersistedAsset> {
  const sha256Hash = createHash("sha256").update(content).digest("hex");
  const existingResult = await executeQuery<ImageAssetRow>(
    pool,
    `
      SELECT id
      FROM image_assets
      WHERE sha256_hash = $1
      LIMIT 1
    `,
    [sha256Hash]
  );

  if (existingResult.rows[0]) {
    return {
      id: Number(existingResult.rows[0].id),
      storageKey: buildAssetStorageKey(sha256Hash, resolveStoredImageExtension(mimeType, sourceUrl))
    };
  }

  const extension = resolveStoredImageExtension(mimeType, sourceUrl);
  const storageKey = buildAssetStorageKey(sha256Hash, extension);
  await storage.writeLocalFile(storageKey, content);

  const insertResult = await executeQuery(
    pool,
    `
      INSERT INTO image_assets (
        storage_type,
        storage_key,
        public_url,
        sha256_hash,
        mime_type,
        file_size_bytes
      )
      VALUES ('local', $1, NULL, $2, $3, $4)
    `,
    [storageKey, sha256Hash, mimeType || inferMimeTypeFromFileName(sourceUrl), content.byteLength]
  );

  return {
    id: Number(insertResult.insertId),
    storageKey
  };
}

async function cleanupUnusedAsset(
  storage: StorageService,
  pool: ReturnType<typeof createDatabasePool>,
  assetId: number
): Promise<void> {
  const referencesResult = await executeQuery<{ count: number | string }>(
    pool,
    `
      SELECT COUNT(*) AS count
      FROM word_images
      WHERE image_asset_id = $1
    `,
    [assetId]
  );

  if (Number(referencesResult.rows[0]?.count || 0) > 0) {
    return;
  }

  const assetResult = await executeQuery<{ storage_type: string; storage_key: string | null }>(
    pool,
    `
      SELECT storage_type, storage_key
      FROM image_assets
      WHERE id = $1
      LIMIT 1
    `,
    [assetId]
  );

  const asset = assetResult.rows[0];

  if (!asset) {
    return;
  }

  if (asset.storage_type === "local" && asset.storage_key) {
    await storage.deleteLocalFile(asset.storage_key);
  }

  await executeQuery(
    pool,
    `
      DELETE FROM image_assets
      WHERE id = $1
    `,
    [assetId]
  );
}

function buildOpenverseSourceCredit(result: OpenverseImageResult): string {
  const title = compactCreditPart(result.title?.trim() || "Untitled", 72);
  const source = compactCreditPart(result.source || result.provider || "openverse", 32);
  const creator = compactCreditPart(result.creator?.trim() || "unknown creator", 72);
  const license =
    result.license && result.license_version
      ? `${result.license.toUpperCase()} ${result.license_version}`
      : result.license?.toUpperCase() || "unknown license";
  const landingUrl = (result.foreign_landing_url || result.url || "").trim();

  const baseCredit = `${title} | ${source} | ${creator} | ${compactCreditPart(license, 24)}`;

  if (!landingUrl) {
    return truncateSourceCredit(baseCredit);
  }

  const withUrl = `${baseCredit} | ${landingUrl}`;

  if (withUrl.length <= SOURCE_CREDIT_MAX_LENGTH) {
    return withUrl;
  }

  return truncateSourceCredit(baseCredit);
}

function compactCreditPart(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  if (maxLength <= 3) {
    return normalized.slice(0, maxLength);
  }

  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function truncateSourceCredit(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= SOURCE_CREDIT_MAX_LENGTH) {
    return normalized;
  }

  return normalized.slice(0, SOURCE_CREDIT_MAX_LENGTH);
}

function toOptionalNumber(value: number | string | null): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function featherIcon(iconName: string, title: string): DirectReplacementSource {
  const sourcePageUrl = `https://github.com/feathericons/feather/blob/master/icons/${iconName}.svg`;
  return {
    sourceLabel: "Curated",
    sourceCredit: `${title} | Feather Icons | MIT | ${sourcePageUrl}`,
    url: `https://raw.githubusercontent.com/feathericons/feather/master/icons/${iconName}.svg`
  };
}

function buildAssetStorageKey(sha256Hash: string, extension: string): string {
  return path.posix.join(
    "assets",
    sha256Hash.slice(0, 2),
    sha256Hash.slice(2, 4),
    `${sha256Hash}${extension}`
  );
}

function detectMimeType(content: Buffer, sourceUrl: string): string {
  if (content.byteLength >= 12) {
    if (
      content[0] === 0x89 &&
      content[1] === 0x50 &&
      content[2] === 0x4e &&
      content[3] === 0x47
    ) {
      return "image/png";
    }

    if (content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff) {
      return "image/jpeg";
    }

    if (
      content[0] === 0x47 &&
      content[1] === 0x49 &&
      content[2] === 0x46 &&
      content[3] === 0x38
    ) {
      return "image/gif";
    }

    if (
      content[0] === 0x52 &&
      content[1] === 0x49 &&
      content[2] === 0x46 &&
      content[3] === 0x46 &&
      content[8] === 0x57 &&
      content[9] === 0x45 &&
      content[10] === 0x42 &&
      content[11] === 0x50
    ) {
      return "image/webp";
    }
  }

  const prefixText = content.slice(0, 256).toString("utf8").trimStart().toLowerCase();

  if (prefixText.startsWith("<?xml") || prefixText.startsWith("<svg")) {
    return "image/svg+xml";
  }

  return inferMimeTypeFromFileName(sourceUrl);
}

function inferMimeTypeFromFileName(fileNameOrUrl: string): string {
  const extension = path.extname(new URL(fileNameOrUrl, "https://placeholder.local").pathname).toLowerCase();

  switch (extension) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".avif":
      return "image/avif";
    case ".jpg":
    case ".jpeg":
    default:
      return "image/jpeg";
  }
}

function resolveStoredImageExtension(contentType: string, fileNameOrUrl: string): string {
  switch (contentType) {
    case "image/avif":
      return ".avif";
    case "image/apng":
      return ".png";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/svg+xml":
      return ".svg";
    case "image/jpeg":
      return ".jpg";
    default: {
      try {
        const url = new URL(fileNameOrUrl);
        const extension = path.extname(url.pathname).toLowerCase();

        if (extension) {
          return extension;
        }
      } catch (error) {
        return ".jpg";
      }

      return ".jpg";
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
