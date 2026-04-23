#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const SOURCES = [
  {
    id: "junior-high",
    label: "初中词表",
    rawPath: path.resolve(process.cwd(), "data", "raw", "junior-high.txt")
  },
  {
    id: "senior-high",
    label: "高中词表",
    rawPath: path.resolve(process.cwd(), "data", "raw", "senior-high.txt")
  }
];

const DEFAULT_OUTPUT_DIR = path.resolve(process.cwd(), "data", "wordlists");

// 词性标签列表（按常见程度排序）
const POS_TAGS = [
  "n.", "v.", "vt.", "vi.", "adj.", "adv.", "prep.", "conj.", "pron.",
  "num.", "int.", "aux.", "modal verb.", "abbr.", "art.", "det."
];

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await mkdir(options.outputDir, { recursive: true });

  for (const source of SOURCES) {
    const text = await readFile(source.rawPath);
    const entries = parseEntries(text, source);

    const payload = {
      sourceId: source.id,
      label: source.label,
      totalEntries: entries.length,
      entries
    };

    const jsonPath = path.join(options.outputDir, `${source.id}-cleaned.json`);
    await writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

    console.log(`${source.label}: ${entries.length} entries saved to ${jsonPath}`);
  }
}

function parseArgs(argv) {
  const options = {
    outputDir: DEFAULT_OUTPUT_DIR
  };

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--out-dir") {
      options.outputDir = path.resolve(process.cwd(), argv[i + 1]);
      i += 1;
    } else if (argv[i] === "--help" || argv[i] === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${argv[i]}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Usage:
  node scripts/clean-school-words.mjs

Options:
  --out-dir <path>   Output directory. Default: data/wordlists
  --help, -h         Show this help
`);
}

async function readFile(filePath) {
  const { readFile: fsReadFile } = await import("node:fs/promises");
  return fsReadFile(filePath, "utf8");
}

/**
 * 解析原始词表文本，返回清洗后的词条数组。
 *
 * 核心逻辑：
 * 1. 跳过空行、注释行、非英文开头的行、含空格的词组
 * 2. 大小写敏感：may 和 May 是不同词条
 * 3. 同一个 word 的多条记录合并：不同词性的释义合并到一起
 * 4. 每个词性最多保留 2 个义项，优先选择语义差异大的义项
 */
function parseEntries(text, source) {
  const lines = text.split(/\r?\n/);
  // 用 Map 按 word 原始大小写分组，保留大小写差异
  const wordMap = new Map();

  for (const line of lines) {
    const parsed = parseLine(line);
    if (!parsed) continue;

    const key = parsed.word; // 大小写敏感的 key

    if (!wordMap.has(key)) {
      wordMap.set(key, { word: key, posEntries: [], sourceId: source.id });
    }

    const entry = wordMap.get(key);
    // 将该行的所有词性释义追加到 posEntries
    for (const pe of parsed.posEntries) {
      mergePosEntry(entry.posEntries, pe);
    }
  }

  // 对每个词条的每个词性，截取最多 2 个义项
  const result = [];
  for (const entry of wordMap.values()) {
    const trimmedPos = entry.posEntries.map(pe => ({
      pos: pe.pos,
      meanings: pickDiverseMeanings(pe.meanings, 2)
    }));
    result.push({ word: entry.word, definitions: trimmedPos, sourceId: entry.sourceId });
  }

  return result;
}

/**
 * 解析单行文本，提取 word 和词性释义列表。
 * 格式示例: "boat	n. 小船；轮船 v. 划船"
 */
function parseLine(line) {
  const cleaned = line.replace(/\uFEFF/g, "").trim();
  if (!cleaned || cleaned.startsWith("#")) return null;

  // 去掉行首编号如 "1." "2)"
  const noBullet = cleaned.replace(/^\d+[\.\)]\s*/, "").trim();
  // 按制表符分割，第一列是单词
  const fields = noBullet.split(/\t+/);
  const firstField = (fields[0] || "").trim();

  // 提取英文单词部分
  const headwordMatch = firstField.match(/^[A-Za-z][A-Za-z'-]*$/);
  if (!headwordMatch) return null;

  const word = headwordMatch[0];
  // 排除词组（含空格）
  if (word.includes(" ")) return null;

  // 剩余部分是释义
  // 如果有第二列（制表符分隔），释义在第二列；否则在第一列单词后面
  const defText = fields.length > 1
    ? (fields.slice(1).join("\t").trim())
    : firstField.slice(word.length).trim();

  if (!defText) return null;

  const posEntries = parseDefinitions(defText);
  if (posEntries.length === 0) return null;

  return { word, posEntries };
}

/**
 * 解析释义文本，拆分为 [{ pos, meanings }] 结构。
 * 输入示例: "n. 小船；轮船 v. 划船"
 * 输出: [{ pos: "n.", meanings: ["小船", "轮船"] }, { pos: "v.", meanings: ["划船"] }]
 */
function parseDefinitions(text) {
  // 先去掉方括号中的附加信息如 [复数 parties] [过去式 partied ...]
  let cleaned = text.replace(/\[[^\]]*\]/g, "").trim();

  // 按词性标签拆分
  // 构建正则：匹配任意已知词性标签
  const posPattern = POS_TAGS.map(escapeRegex).join("|");
  const splitRegex = new RegExp(`(${posPattern})`, "g");

  const parts = cleaned.split(splitRegex);

  const result = [];
  let currentPos = null;
  let currentMeaningText = "";

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (POS_TAGS.includes(trimmed)) {
      // 遇到词性标签：保存前一个词性的释义，开始新的
      if (currentPos && currentMeaningText) {
        result.push({ pos: currentPos, meanings: splitMeanings(currentMeaningText) });
      }
      currentPos = trimmed;
      currentMeaningText = "";
    } else if (currentPos) {
      currentMeaningText += trimmed;
    } else {
      // 没有词性标签前缀的文本，可能是补充说明，跳过
    }
  }

  // 最后一个词性
  if (currentPos && currentMeaningText) {
    result.push({ pos: currentPos, meanings: splitMeanings(currentMeaningText) });
  }

  return result;
}

/**
 * 将释义文本按分号拆分为义项列表。
 * "小船；轮船" → ["小船", "轮船"]
 * 也会处理中文顿号和逗号作为次级分隔（仅在分号不存在时）
 */
function splitMeanings(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // 优先按中文分号拆分
  if (trimmed.includes("；")) {
    return trimmed.split("；").map(s => s.trim()).filter(s => s);
  }

  // 按中文逗号拆分，但要注意有些释义本身包含逗号短语
  // 简单策略：按逗号拆分，过滤掉太短的碎片（<2字符）
  if (trimmed.includes("，")) {
    const parts = trimmed.split("，").map(s => s.trim()).filter(s => s.length >= 2);
    if (parts.length > 1) return parts;
  }

  // 按英文分号拆分
  if (trimmed.includes(";")) {
    return trimmed.split(";").map(s => s.trim()).filter(s => s);
  }

  // 按英文逗号拆分
  if (trimmed.includes(",")) {
    const parts = trimmed.split(",").map(s => s.trim()).filter(s => s.length >= 2);
    if (parts.length > 1) return parts;
  }

  return [trimmed];
}

/**
 * 从义项列表中选取最多 maxCount 个，优先选择语义差异大的。
 *
 * 策略：取第一个义项，然后从剩余中选与已选义项最不相似的。
 * "最不相似"的判断：共享汉字越少越不相似。
 */
function pickDiverseMeanings(meanings, maxCount) {
  if (meanings.length <= maxCount) return meanings;

  const picked = [meanings[0]];

  while (picked.length < maxCount) {
    const pickedChars = new Set(picked.join("").split(""));
    let bestCandidate = null;
    let bestScore = -1;

    for (const m of meanings) {
      if (picked.includes(m)) continue;
      const mChars = new Set(m.split(""));
      // 计算与已选义项的共享字符数，越少越好（语义差异大）
      let overlap = 0;
      for (const ch of mChars) {
        if (pickedChars.has(ch)) overlap++;
      }
      // score = 总字符数 - 共享字符数，越大说明越不同
      const score = mChars.size - overlap;
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = m;
      }
    }

    if (bestCandidate) {
      picked.push(bestCandidate);
    } else {
      break;
    }
  }

  return picked;
}

/**
 * 将新解析出的词性释义合并到已有列表中。
 * 同词性的义项追加到已有义项列表（去重）。
 */
function mergePosEntry(posEntries, newPe) {
  const existing = posEntries.find(pe => pe.pos === newPe.pos);
  if (existing) {
    for (const m of newPe.meanings) {
      if (!existing.meanings.includes(m)) {
        existing.meanings.push(m);
      }
    }
  } else {
    posEntries.push({ pos: newPe.pos, meanings: [...newPe.meanings] });
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});