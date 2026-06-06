import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";

interface GenerateWordCardInput {
  english: string;
  chinese: string;
}

export function generateWordCardSvg(input: GenerateWordCardInput): Buffer {
  const english = escapeXml(input.english.trim() || "?");
  const chinese = escapeXml(compactChinese(input.chinese));
  const palette = selectPalette(input.english);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-label="${english}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.start}"/>
      <stop offset="100%" stop-color="${palette.end}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="900" rx="48" fill="url(#bg)"/>
  <circle cx="1030" cy="170" r="150" fill="${palette.accent}" opacity="0.18"/>
  <circle cx="180" cy="760" r="190" fill="${palette.accent}" opacity="0.12"/>
  <rect x="76" y="76" width="1048" height="748" rx="36" fill="#ffffff" opacity="0.9"/>
  <text x="120" y="260" font-family="Georgia, 'Times New Roman', serif" font-size="118" font-weight="700" fill="#111111">${english}</text>
  <text x="124" y="342" font-family="'Noto Sans SC', 'Microsoft YaHei', sans-serif" font-size="34" font-weight="600" fill="#2b2b2b">${chinese}</text>
  <line x1="120" y1="392" x2="1080" y2="392" stroke="${palette.line}" stroke-width="3" opacity="0.9"/>
  <text x="120" y="520" font-family="'Noto Sans SC', 'Microsoft YaHei', sans-serif" font-size="28" fill="#444444">Word Image Memo</text>
  <text x="120" y="590" font-family="Georgia, 'Times New Roman', serif" font-size="176" font-weight="700" fill="${palette.mark}" opacity="0.16">${escapeXml(
    buildMonogram(input.english)
  )}</text>
</svg>`;

  return Buffer.from(svg, "utf8");
}

export function buildWordCardSourceCredit(input: GenerateWordCardInput): string {
  const digest = createHash("sha1")
    .update(`${input.english}::${input.chinese}`, "utf8")
    .digest("hex")
    .slice(0, 12);

  return `Generated fallback card | ${input.english} | ${digest}`;
}

function selectPalette(seed: string): { start: string; end: string; accent: string; line: string; mark: string } {
  const palettes = [
    { start: "#f6efe5", end: "#eadfce", accent: "#b67a3c", line: "#c8b7a1", mark: "#8b5b2b" },
    { start: "#eef4f1", end: "#dfece6", accent: "#3d7d64", line: "#a8c3b7", mark: "#2f5d4c" },
    { start: "#eef2f8", end: "#dde6f5", accent: "#496ea8", line: "#b2c1dc", mark: "#35527c" },
    { start: "#f7f0f2", end: "#eddde3", accent: "#a4556f", line: "#d6b0bd", mark: "#7d3d53" },
    { start: "#f3f1e7", end: "#e7e1c8", accent: "#8c7a2f", line: "#cbbb84", mark: "#695b20" }
  ];
  const hash = createHash("md5").update(seed.toLowerCase(), "utf8").digest();
  return palettes[hash[0] % palettes.length];
}

function buildMonogram(english: string): string {
  const letters = english.replace(/[^a-z]/gi, "").toUpperCase();

  if (!letters) {
    return "?";
  }

  if (letters.length === 1) {
    return letters;
  }

  return letters.slice(0, 2);
}

function compactChinese(chinese: string): string {
  const normalized = chinese
    .replace(/\s+/g, " ")
    .replace(/[；;].*$/u, "")
    .replace(/[，,].*$/u, "")
    .trim();

  return normalized || chinese.trim() || "";
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
