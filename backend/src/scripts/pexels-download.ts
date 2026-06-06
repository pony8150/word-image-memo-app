import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const PEXELS_TARGET_MAX_BYTES = 500 * 1024;
const HTML_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
const PEXELS_WIDTH_CANDIDATES = [1600, 1280, 1080, 960, 840, 720, 640, 560, 480, 400];

interface DownloadedPexelsImage {
  content: Buffer;
  mimeType: string;
  optimizedUrl: string;
  byteLength: number;
}

export async function downloadPexelsImageWithinLimit(
  referenceUrl: string,
  maxBytes = PEXELS_TARGET_MAX_BYTES
): Promise<DownloadedPexelsImage> {
  const photoId = extractPexelsPhotoId(referenceUrl);

  if (!photoId) {
    throw new Error(`Could not extract a Pexels photo id from ${referenceUrl}.`);
  }

  let smallestAttempt: DownloadedPexelsImage | null = null;

  for (const candidateUrl of buildPexelsVariantUrls(photoId)) {
    const downloaded = await downloadBinary(candidateUrl);

    if (!smallestAttempt || downloaded.byteLength < smallestAttempt.byteLength) {
      smallestAttempt = downloaded;
    }

    if (downloaded.byteLength <= maxBytes) {
      return downloaded;
    }
  }

  if (smallestAttempt) {
    return smallestAttempt;
  }

  throw new Error(`Could not download a usable Pexels image for ${referenceUrl}.`);
}

export function extractPexelsPhotoId(value: string): string | null {
  const photoPathMatch = value.match(/\/photos\/(\d+)\//);

  if (photoPathMatch?.[1]) {
    return photoPathMatch[1];
  }

  const slugMatch = value.match(/-(\d+)\/?$/);
  return slugMatch?.[1] || null;
}

function buildPexelsVariantUrls(photoId: string): string[] {
  return PEXELS_WIDTH_CANDIDATES.map(
    (width) =>
      `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&w=${width}&h=${Math.round(
        width * 1.25
      )}&fm=jpg`
  );
}

async function downloadBinary(url: string): Promise<DownloadedPexelsImage> {
  const tempDirectoryPath = await mkdtemp(path.join(tmpdir(), "pexels-optimized-"));
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
        "-e",
        "https://www.pexels.com/",
        "-H",
        "Accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "-o",
        tempFilePath,
        url
      ],
      {
        timeout: 30000,
        maxBuffer: 1024 * 1024
      }
    );

    const content = await readFile(tempFilePath);
    return {
      content,
      mimeType: detectMimeType(content),
      optimizedUrl: url,
      byteLength: content.byteLength
    };
  } finally {
    await rm(tempDirectoryPath, { recursive: true, force: true });
  }
}

function detectMimeType(content: Buffer): string {
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

  return "image/jpeg";
}
