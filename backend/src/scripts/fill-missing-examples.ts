import { appendFile, copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { appEnv, getRequiredOpenAiApiKey, getRequiredOpenAiModel } from "../config/env";

interface WordlistEntry {
  index: number;
  word: string;
  meaning: string;
  page?: string | null;
  example?: string | null;
  exampleChinese?: string | null;
}

interface BookSourceDefinition {
  code: string;
  fileName: string;
}

interface ScriptOptions {
  bookCode: string;
  limit: number | null;
  batchSize: number;
  maxAttempts: number;
  overwrite: boolean;
  skipBackup: boolean;
  skipOnValidationFailure: boolean;
}

interface ExampleWorkItem {
  index: number;
  word: string;
  meaning: string;
  theme: string | null;
  existingExample: string | null;
  existingExampleChinese: string | null;
}

interface GeneratedExampleItem {
  index: number;
  word: string;
  example: string;
  exampleChinese: string;
}

interface BatchGenerationResult {
  items: GeneratedExampleItem[];
}

interface OpenAiErrorPayload {
  error?: {
    message?: string;
  };
}

class OpenAiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "OpenAiRequestError";
    this.status = status;
  }
}

const BOOK_SOURCES: BookSourceDefinition[] = [
  { code: "junior-high", fileName: "初中词汇.json" },
  { code: "senior-high", fileName: "高中词汇.json" },
  { code: "postgraduate-redbook", fileName: "红宝书-考研词汇.json" }
];

const WORDLIST_DIRECTORY = path.resolve(process.cwd(), "..", "data", "wordlists");
const LOG_DIRECTORY = path.resolve(process.cwd(), "logs");
const DEFAULT_BOOK_CODE = "junior-high";
const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_MAX_ATTEMPTS = 3;
const MODEL_TIMEOUT_MS = 120000;
const EXAMPLE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          index: { type: "integer" },
          word: { type: "string" },
          example: { type: "string" },
          exampleChinese: { type: "string" }
        },
        required: ["index", "word", "example", "exampleChinese"]
      }
    }
  },
  required: ["items"]
} as const;

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const apiKey = getRequiredOpenAiApiKey();
  const model = getRequiredOpenAiModel();
  const startedAt = createTimestamp();

  await mkdir(LOG_DIRECTORY, { recursive: true });

  for (const source of resolveBookSources(options.bookCode)) {
    await fillMissingExamplesForSource(source, options, apiKey, model, startedAt);
  }
}

async function fillMissingExamplesForSource(
  source: BookSourceDefinition,
  options: ScriptOptions,
  apiKey: string,
  model: string,
  startedAt: string
) {
  const filePath = await resolveWordlistSourcePath(source);
  const logPath = path.resolve(LOG_DIRECTORY, `fill-missing-examples-${source.code}-${startedAt}.log`);
  const entries = JSON.parse(await readFile(filePath, "utf8")) as WordlistEntry[];
  const targets = entries
    .filter((entry) => shouldProcessEntry(entry, options.overwrite))
    .slice(0, options.limit ?? Number.MAX_SAFE_INTEGER)
    .map((entry) => ({
      index: entry.index,
      word: normalizeWord(entry.word),
      meaning: normalizeText(entry.meaning) || "",
      theme: normalizeText(entry.page),
      existingExample: normalizeText(entry.example),
      existingExampleChinese: normalizeText(entry.exampleChinese)
    }));

  if (targets.length === 0) {
    console.log(`No missing examples need processing for "${source.code}".`);
    return;
  }

  if (!options.skipBackup) {
    const backupPath = path.resolve(
      WORDLIST_DIRECTORY,
      source.fileName.replace(/\.json$/i, `.backup-before-examples-${startedAt}.json`)
    );
    await copyFile(filePath, backupPath);
    console.log(`Created backup for "${source.code}" at ${backupPath}`);
  }

  const entriesByIndex = new Map(entries.map((entry) => [entry.index, entry] as const));
  console.log(`Processing "${source.code}" with ${targets.length} word(s), batch size ${options.batchSize}.`);

  let processedCount = 0;
  let skippedCount = 0;

  for (let offset = 0; offset < targets.length; offset += options.batchSize) {
    const batch = targets.slice(offset, offset + options.batchSize);
    const generated = await generateExamplesForBatch(
      batch,
      apiKey,
      model,
      options.maxAttempts,
      options.skipOnValidationFailure,
      logPath
    );

    generated.items.forEach((item) => {
      const entry = entriesByIndex.get(item.index);

      if (!entry) {
        throw new Error(`Unable to find word entry with index ${item.index}.`);
      }

      if (options.overwrite || !hasText(entry.example)) {
        entry.example = item.example;
      }

      if (options.overwrite || !hasText(entry.exampleChinese)) {
        entry.exampleChinese = item.exampleChinese;
      }
    });

    await writeFile(filePath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
    processedCount += generated.items.length;
    skippedCount += generated.skipped.length;

    const progressLine = `[${new Date().toISOString()}] ${source.code}: ${processedCount} updated, ${skippedCount} skipped, ${processedCount + skippedCount}/${targets.length} processed`;
    await appendFile(logPath, `${progressLine}\n`, "utf8");
    console.log(progressLine);
  }

  console.log(`Finished "${source.code}". Wrote ${processedCount} example pair(s), skipped ${skippedCount}.`);
}

async function resolveWordlistSourcePath(source: BookSourceDefinition): Promise<string> {
  const fileNames = await readdir(WORDLIST_DIRECTORY);

  switch (source.code) {
    case "junior-high": {
      const resolvedFileName = fileNames.find((fileName) => /初中词汇\.json$/u.test(fileName));
      if (resolvedFileName) {
        return path.resolve(WORDLIST_DIRECTORY, resolvedFileName);
      }
      break;
    }
    case "senior-high": {
      const resolvedFileName = fileNames.find((fileName) => /高中词汇\.json$/u.test(fileName));
      if (resolvedFileName) {
        return path.resolve(WORDLIST_DIRECTORY, resolvedFileName);
      }
      break;
    }
    case "postgraduate-redbook": {
      const resolvedFileName = fileNames.find((fileName) => /考研词汇\.json$/u.test(fileName));
      if (resolvedFileName) {
        return path.resolve(WORDLIST_DIRECTORY, resolvedFileName);
      }
      break;
    }
    default:
      break;
  }

  return path.resolve(WORDLIST_DIRECTORY, source.fileName);
}

async function generateExamplesForBatch(
  batch: ExampleWorkItem[],
  apiKey: string,
  model: string,
  maxAttempts: number,
  skipOnValidationFailure: boolean,
  logPath: string
): Promise<BatchGenerationResult & { skipped: ExampleWorkItem[] }> {
  try {
    return {
      ...(await generateExamplesForBatchStrict(batch, apiKey, model, maxAttempts)),
      skipped: []
    };
  } catch (error) {
    if (batch.length === 1) {
      if (skipOnValidationFailure) {
        const skippedWord = batch[0];
        const reason = error instanceof Error ? error.message : String(error);
        const line = `[${new Date().toISOString()}] skipped ${skippedWord.word} (#${skippedWord.index}): ${reason}`;
        await appendFile(logPath, `${line}\n`, "utf8");
        console.warn(line);
        return {
          items: [],
          skipped: [skippedWord]
        };
      }

      throw error;
    }

    const splitSize = Math.max(1, Math.floor(batch.length / 2));
    console.warn(
      `Falling back to smaller batches after failure on ${batch.length} items; next batch size ${splitSize}.`
    );

    const mergedItems: GeneratedExampleItem[] = [];
    const skippedItems: ExampleWorkItem[] = [];

    for (let offset = 0; offset < batch.length; offset += splitSize) {
      const slice = batch.slice(offset, offset + splitSize);
      const partialResult = await generateExamplesForBatch(
        slice,
        apiKey,
        model,
        maxAttempts,
        skipOnValidationFailure,
        logPath
      );
      mergedItems.push(...partialResult.items);
      skippedItems.push(...partialResult.skipped);
    }

    return {
      items: mergedItems,
      skipped: skippedItems
    };
  }
}

async function generateExamplesForBatchStrict(
  batch: ExampleWorkItem[],
  apiKey: string,
  model: string,
  maxAttempts: number
): Promise<BatchGenerationResult> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const payload = await requestStructuredBatchExamples(apiKey, model, buildBatchPrompt(batch, attempt));
      return validateBatchGenerationResult(payload, batch);
    } catch (error) {
      lastError = error;
      console.warn(`Batch attempt ${attempt}/${maxAttempts} failed: ${error instanceof Error ? error.message : String(error)}`);

      if (attempt < maxAttempts) {
        await sleep(attempt * 1500);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function requestStructuredBatchExamples(
  apiKey: string,
  model: string,
  prompt: string
): Promise<unknown> {
  try {
    return await requestWithResponsesApi(apiKey, model, prompt);
  } catch (error) {
    if (!shouldFallbackToChatCompletions(error)) {
      throw error;
    }

    console.warn("Responses API request failed. Falling back to Chat Completions.");
    return requestWithChatCompletionsApi(apiKey, model, prompt);
  }
}

async function requestWithResponsesApi(
  apiKey: string,
  model: string,
  prompt: string
): Promise<unknown> {
  const response = await fetchWithTimeout(`${appEnv.openAiBaseUrl}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      reasoning: {
        effort: appEnv.openAiReasoningEffort
      },
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: buildSystemPrompt() }]
        },
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "word_examples_batch",
          strict: true,
          schema: EXAMPLE_SCHEMA
        }
      }
    })
  });

  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throw new OpenAiRequestError(extractOpenAiErrorMessage(payload, response.status), response.status);
  }

  return parseResponsesPayload(payload);
}

async function requestWithChatCompletionsApi(
  apiKey: string,
  model: string,
  prompt: string
): Promise<unknown> {
  const response = await fetchWithTimeout(`${appEnv.openAiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "word_examples_batch",
          strict: true,
          schema: EXAMPLE_SCHEMA
        }
      }
    })
  });

  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throw new OpenAiRequestError(extractOpenAiErrorMessage(payload, response.status), response.status);
  }

  return parseChatCompletionsPayload(payload);
}

function buildSystemPrompt(): string {
  return [
    "You write study-friendly English example sentences and Simplified Chinese translations for a vocabulary app.",
    "Return JSON only and follow the schema exactly.",
    "Use the exact target word in the English sentence.",
    "Keep the target word exactly as provided; do not change its tense, number, comparison, or derivation.",
    "If the target word is a verb, prefer patterns like 'can WORD', 'will WORD', or 'to WORD' so the base form stays unchanged.",
    "Prefer the most common sense that matches the provided Chinese meaning.",
    "Keep the sentence concise, natural, concrete, and school-safe."
  ].join("\n");
}

function buildBatchPrompt(batch: ExampleWorkItem[], attempt: number): string {
  return JSON.stringify(
    {
      task: "Generate example sentences and Chinese translations.",
      retryAttempt: attempt,
      items: batch
    },
    null,
    2
  );
}

function validateBatchGenerationResult(payload: unknown, batch: ExampleWorkItem[]): BatchGenerationResult {
  if (!payload || typeof payload !== "object" || !Array.isArray((payload as { items?: unknown[] }).items)) {
    throw new Error("Model output did not match the expected structure.");
  }

  const sourceByIndex = new Map(batch.map((item) => [item.index, item] as const));
  const items = (payload as { items: unknown[] }).items.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("Model returned a malformed item.");
    }

    const value = item as Partial<GeneratedExampleItem>;
    const source = sourceByIndex.get(Number(value.index));

    if (!source) {
      throw new Error(`Unexpected item index ${String(value.index)}.`);
    }

    const word = normalizeWord(value.word);
    const example = normalizeGeneratedEnglishSentence(value.example);
    const exampleChinese = normalizeGeneratedChineseSentence(value.exampleChinese);

    if (word !== source.word) {
      throw new Error(`Model returned the wrong word for index ${source.index}.`);
    }

    if (!containsTargetWord(example, source.word)) {
      throw new Error(`Generated example for "${source.word}" is missing the target word.`);
    }

    if (!exampleChinese) {
      throw new Error(`Generated Chinese translation for "${source.word}" is empty.`);
    }

    return {
      index: source.index,
      word: source.word,
      example,
      exampleChinese
    };
  });

  if (items.length !== batch.length) {
    throw new Error(`Model returned ${items.length} items for a batch of ${batch.length}.`);
  }

  return { items };
}

function parseArgs(argv: string[]): ScriptOptions {
  const options: ScriptOptions = {
    bookCode: DEFAULT_BOOK_CODE,
    limit: null,
    batchSize: DEFAULT_BATCH_SIZE,
    maxAttempts: DEFAULT_MAX_ATTEMPTS,
    overwrite: false,
    skipBackup: false,
    skipOnValidationFailure: true
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = String(argv[index] || "").trim();

    if (!current) {
      continue;
    }

    if (!current.startsWith("--")) {
      options.bookCode = current.toLowerCase();
      continue;
    }

    if (current === "--limit") {
      options.limit = parsePositiveInteger(argv[index + 1], "--limit");
      index += 1;
      continue;
    }

    if (current === "--batch-size") {
      options.batchSize = parsePositiveInteger(argv[index + 1], "--batch-size");
      index += 1;
      continue;
    }

    if (current === "--max-attempts") {
      options.maxAttempts = parsePositiveInteger(argv[index + 1], "--max-attempts");
      index += 1;
      continue;
    }

    if (current === "--overwrite") {
      options.overwrite = true;
      continue;
    }

    if (current === "--skip-backup") {
      options.skipBackup = true;
      continue;
    }

    if (current === "--strict") {
      options.skipOnValidationFailure = false;
      continue;
    }

    if (current === "--help" || current === "-h") {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${current}`);
  }

  return options;
}

function printHelp() {
  console.log(`
Usage:
  npm.cmd run fill:missing-examples -- junior-high
  npm.cmd run fill:missing-examples -- senior-high --limit 100 --batch-size 10
  npm.cmd run fill:missing-examples -- all
`);
}

function resolveBookSources(bookCode: string): BookSourceDefinition[] {
  if (bookCode === "all") {
    return BOOK_SOURCES;
  }

  const source = BOOK_SOURCES.find((item) => item.code === bookCode);

  if (!source) {
    throw new Error(`Unsupported book code "${bookCode}".`);
  }

  return [source];
}

function shouldProcessEntry(entry: WordlistEntry, overwrite: boolean): boolean {
  return overwrite || !hasText(entry.example) || !hasText(entry.exampleChinese);
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  return JSON.parse(text);
}

function parseResponsesPayload(payload: unknown): unknown {
  const data = payload as {
    output_text?: unknown;
    output?: Array<{ content?: Array<{ text?: unknown }> }>;
  };
  const outputText =
    (typeof data.output_text === "string" && data.output_text) ||
    data.output?.flatMap((item) =>
      Array.isArray(item.content)
        ? item.content.map((contentItem) => (typeof contentItem?.text === "string" ? contentItem.text : ""))
        : []
    ).join("\n");

  if (!outputText) {
    throw new Error("Responses API payload did not contain structured text output.");
  }

  return parseLooseJson(outputText);
}

function parseChatCompletionsPayload(payload: unknown): unknown {
  const data = payload as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  const text = typeof content === "string" ? content : "";

  if (!text) {
    throw new Error("Chat Completions payload did not contain structured text output.");
  }

  return parseLooseJson(text);
}

function parseLooseJson(value: string): unknown {
  const trimmed = value.trim();

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]+?)```/i);

    if (fencedMatch) {
      return JSON.parse(fencedMatch[1].trim());
    }

    throw new Error(`Unable to parse model JSON output: ${trimmed.slice(0, 200)}`);
  }
}

function extractOpenAiErrorMessage(payload: unknown, status: number): string {
  return (payload as OpenAiErrorPayload)?.error?.message || `OpenAI request failed with status ${status}.`;
}

function shouldFallbackToChatCompletions(error: unknown): boolean {
  if (!(error instanceof OpenAiRequestError)) {
    return false;
  }

  if (![400, 404, 405, 422].includes(error.status)) {
    return false;
  }

  const message = String(error.message || "").toLowerCase();
  return ["text.format", "json_schema", "responses", "not found", "unsupported"].some((fragment) =>
    message.includes(fragment)
  );
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutHandle);
  }
}

function normalizeWord(value: unknown): string {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized || null;
}

function normalizeGeneratedEnglishSentence(value: unknown): string {
  const normalized = normalizeText(value) || "";
  const trimmed = normalized.replace(/^["']|["']$/g, "").trim();

  if (!trimmed) {
    return "";
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function normalizeGeneratedChineseSentence(value: unknown): string {
  const normalized = normalizeText(value) || "";
  const trimmed = normalized.replace(/^[“”"']|[“”"']$/g, "").trim();

  if (!trimmed) {
    return "";
  }

  return /[。！？.!?]$/.test(trimmed) ? trimmed : `${trimmed}。`;
}

function containsTargetWord(example: string, word: string): boolean {
  const pattern = new RegExp(`(^|[^A-Za-z])${escapeRegex(word)}([^A-Za-z]|$)`, "i");
  return pattern.test(example);
}

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function parsePositiveInteger(rawValue: string | undefined, optionName: string): number {
  const value = Number(rawValue);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${optionName} expects a positive integer.`);
  }

  return value;
}

function createTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "").replace("T", "-").replace("Z", "Z");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
