import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { appEnv } from "../config/env";

interface DemoSeedImage {
  sortOrder: number;
  storageType: "external" | "local" | "oss";
  storageKey?: string | null;
  publicUrl?: string | null;
  sourceLabel: string;
  sourceCredit: string | null;
}

interface DemoSeedWord {
  sortOrder: number;
  id: string;
  english: string;
  chinese: string;
  level: string | null;
  theme: string | null;
  example: string | null;
  exampleChinese: string | null;
  imageReason: string | null;
  scene: string | null;
  images: DemoSeedImage[];
}

const CONTENT_TYPE_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg"
};

async function main() {
  const seedFilePath = path.resolve(process.cwd(), "seeds", "demo-learning-deck.json");
  const originalWords = JSON.parse(await readFile(seedFilePath, "utf8")) as DemoSeedWord[];
  const nextWords: DemoSeedWord[] = [];

  for (const word of originalWords) {
    const nextImages: DemoSeedImage[] = [];

    for (const image of word.images) {
      if (image.storageType === "local" && image.storageKey) {
        nextImages.push(image);
        continue;
      }

      if (!image.publicUrl) {
        throw new Error(`Image for word "${word.id}" is missing publicUrl.`);
      }

      const response = await fetch(image.publicUrl, {
        headers: {
          "User-Agent": "word-image-memo-app/0.1"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to download ${image.publicUrl}: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() || "";
      const extension = resolveFileExtension(image.publicUrl, contentType);
      const relativeStorageKey = path.posix.join(
        "demo-images",
        word.id,
        `${String(image.sortOrder).padStart(2, "0")}${extension}`
      );
      const absoluteFilePath = path.resolve(appEnv.uploadsDir, relativeStorageKey);

      await mkdir(path.dirname(absoluteFilePath), { recursive: true });
      await writeFile(absoluteFilePath, Buffer.from(await response.arrayBuffer()));

      nextImages.push({
        sortOrder: image.sortOrder,
        storageType: "local",
        storageKey: relativeStorageKey.replace(/\\/g, "/"),
        sourceLabel: image.sourceLabel,
        sourceCredit: image.sourceCredit
      });
    }

    nextWords.push({
      ...word,
      images: nextImages
    });
  }

  await writeFile(seedFilePath, `${JSON.stringify(nextWords, null, 2)}\n`, "utf8");
  console.log(`Downloaded ${countImages(nextWords)} demo image(s) into ${appEnv.uploadsDir}`);
}

function countImages(words: DemoSeedWord[]): number {
  return words.reduce((total, word) => total + word.images.length, 0);
}

function resolveFileExtension(imageUrl: string, contentType: string): string {
  if (CONTENT_TYPE_EXTENSION_MAP[contentType]) {
    return CONTENT_TYPE_EXTENSION_MAP[contentType];
  }

  try {
    const parsedUrl = new URL(imageUrl);
    const extension = path.extname(parsedUrl.pathname);

    if (extension) {
      return extension.toLowerCase();
    }
  } catch (error) {
    return ".jpg";
  }

  return ".jpg";
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
