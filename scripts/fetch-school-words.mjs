#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const SOURCES = [
  {
    id: "junior-high",
    stage: "junior",
    label: "初中词表",
    url: "https://raw.githubusercontent.com/KyleBing/english-vocabulary/master/1%20%E5%88%9D%E4%B8%AD-%E4%B9%B1%E5%BA%8F.txt"
  },
  {
    id: "senior-high",
    stage: "senior",
    label: "高中词表",
    url: "https://raw.githubusercontent.com/KyleBing/english-vocabulary/master/2%20%E9%AB%98%E4%B8%AD-%E4%B9%B1%E5%BA%8F.txt"
  }
];

const DEFAULT_OUTPUT_DIR = path.resolve(process.cwd(), "data", "wordlists");
const DEFAULT_RAW_DIR = path.resolve(process.cwd(), "data", "raw");

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await mkdir(options.outputDir, { recursive: true });

  if (options.keepRaw) {
    await mkdir(options.rawDir, { recursive: true });
  }

  const fetchedSources = [];
  const stageBuckets = new Map([
    ["junior", []],
    ["senior", []]
  ]);
  const mergedWords = new Map();

  for (const source of SOURCES) {
    const text = await downloadText(source.url);
    const entries = parseWordEntries(text, source, options);

    fetchedSources.push({
      id: source.id,
      stage: source.stage,
      label: source.label,
      url: source.url,
      entryCount: entries.length
    });

    if (options.keepRaw) {
      const rawFilePath = path.join(options.rawDir, `${source.id}.txt`);
      await writeFile(rawFilePath, text, "utf8");
    }

    stageBuckets.set(source.stage, entries);

    for (const entry of entries) {
      mergeEntry(mergedWords, entry);
    }
  }

  const mergedList = [...mergedWords.values()].sort((left, right) => left.word.localeCompare(right.word, "en"));
  const payload = buildPayload(mergedList, fetchedSources);

  await writeOutputs(options.outputDir, payload, stageBuckets);

  console.log(`Saved ${payload.totalWords} words to ${options.outputDir}`);
}

function parseArgs(argv) {
  const options = {
    outputDir: DEFAULT_OUTPUT_DIR,
    rawDir: DEFAULT_RAW_DIR,
    includePhrases: false,
    keepRaw: true
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (current === "--out-dir") {
      options.outputDir = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
      continue;
    }

    if (current === "--raw-dir") {
      options.rawDir = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
      continue;
    }

    if (current === "--include-phrases") {
      options.includePhrases = true;
      continue;
    }

    if (current === "--skip-raw") {
      options.keepRaw = false;
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
  node scripts/fetch-school-words.mjs

Options:
  --out-dir <path>         Output directory. Default: data/wordlists
  --raw-dir <path>         Raw download directory. Default: data/raw
  --include-phrases        Keep multi-word phrases from the source list
  --skip-raw               Do not save raw source files locally
  --help, -h               Show this help
`);
}

async function downloadText(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function parseWordEntries(text, source, options) {
  const lines = text.split(/\r?\n/);
  const seen = new Set();
  const entries = [];

  lines.forEach((line, lineIndex) => {
    const parsed = parseLine(line, source, lineIndex + 1, options);

    if (!parsed || seen.has(parsed.word)) {
      return;
    }

    seen.add(parsed.word);
    entries.push(parsed);
  });

  return entries;
}

function parseLine(line, source, lineNumber, options) {
  const cleanedLine = line.replace(/\uFEFF/g, "").trim();

  if (!cleanedLine || cleanedLine.startsWith("#")) {
    return null;
  }

  const lineWithoutBullet = cleanedLine.replace(/^\d+[\.\)]\s*/, "").trim();
  const firstField = lineWithoutBullet.split(/\t+/)[0]?.trim() || "";
  const headwordMatch = firstField.match(/^[A-Za-z][A-Za-z' -]*/);

  if (!headwordMatch) {
    return null;
  }

  const normalizedWord = normalizeWord(headwordMatch[0]);

  if (!normalizedWord) {
    return null;
  }

  if (!options.includePhrases && normalizedWord.includes(" ")) {
    return null;
  }

  const note = extractNote(lineWithoutBullet, headwordMatch[0]);

  return {
    word: normalizedWord,
    stage: source.stage,
    sourceId: source.id,
    sourceLabel: source.label,
    lineNumber,
    note,
    raw: lineWithoutBullet
  };
}

function normalizeWord(value) {
  const normalized = value
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[^a-z]+/, "")
    .replace(/[^a-z' -]+$/g, "");

  if (!normalized) {
    return null;
  }

  if (!/^[a-z](?:[a-z' -]*[a-z])?$/.test(normalized)) {
    return null;
  }

  return normalized;
}

function extractNote(line, rawWord) {
  const remainder = line.slice(rawWord.length).trim();

  if (!remainder) {
    return "";
  }

  return remainder
    .replace(/^\[[^\]]+\]\s*/, "")
    .replace(/^\/[^/]+\/\s*/, "")
    .replace(/^[,:;，；：-]+\s*/, "")
    .trim();
}

function mergeEntry(target, entry) {
  if (!target.has(entry.word)) {
    target.set(entry.word, {
      word: entry.word,
      stages: new Set(),
      sourceIds: new Set(),
      notes: new Set()
    });
  }

  const current = target.get(entry.word);
  current.stages.add(entry.stage);
  current.sourceIds.add(entry.sourceId);

  if (entry.note) {
    current.notes.add(entry.note);
  }
}

function buildPayload(mergedList, sources) {
  return {
    generatedAt: new Date().toISOString(),
    sourceStrategy: "公开初中/高中词表文本下载 + 本地清洗去重",
    sources,
    totalWords: mergedList.length,
    words: mergedList.map((item) => ({
      word: item.word,
      stages: [...item.stages].sort(),
      sourceIds: [...item.sourceIds].sort(),
      notes: [...item.notes].sort()
    }))
  };
}

async function writeOutputs(outputDir, payload, stageBuckets) {
  const juniorWords = (stageBuckets.get("junior") || []).map((item) => item.word);
  const seniorWords = (stageBuckets.get("senior") || []).map((item) => item.word);
  const mergedWords = payload.words.map((item) => item.word);

  await Promise.all([
    writeFile(path.join(outputDir, "school-common-words.json"), `${JSON.stringify(payload, null, 2)}\n`, "utf8"),
    writeFile(path.join(outputDir, "school-common-words.txt"), `${mergedWords.join("\n")}\n`, "utf8"),
    writeFile(path.join(outputDir, "junior-high-common-words.txt"), `${juniorWords.join("\n")}\n`, "utf8"),
    writeFile(path.join(outputDir, "senior-high-common-words.txt"), `${seniorWords.join("\n")}\n`, "utf8")
  ]);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
