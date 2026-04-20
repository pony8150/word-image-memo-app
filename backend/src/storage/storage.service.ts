import { Injectable, OnModuleInit } from "@nestjs/common";
import { mkdir, rm } from "node:fs/promises";
import * as path from "node:path";
import { appEnv } from "../config/env";

interface ImageLocation {
  storageType: string;
  storageKey: string | null;
  publicUrl: string | null;
}

@Injectable()
export class StorageService implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await mkdir(appEnv.uploadsDir, { recursive: true });
  }

  resolvePublicUrl(image: ImageLocation): string {
    if (image.storageType === "local" && image.storageKey) {
      return `${appEnv.publicBaseUrl}/uploads/${image.storageKey.replace(/\\/g, "/")}`;
    }

    return image.publicUrl || "";
  }

  async deleteLocalFile(storageKey: string): Promise<void> {
    const absoluteFilePath = this.resolveLocalPath(storageKey);
    await rm(absoluteFilePath, { force: true });
  }

  private resolveLocalPath(storageKey: string): string {
    const absoluteFilePath = path.resolve(appEnv.uploadsDir, storageKey);
    const relativePath = path.relative(appEnv.uploadsDir, absoluteFilePath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      throw new Error(`Refusing to access file outside uploads directory: ${storageKey}`);
    }

    return absoluteFilePath;
  }
}
