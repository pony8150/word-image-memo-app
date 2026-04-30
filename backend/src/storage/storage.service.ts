import { Injectable, OnModuleInit } from "@nestjs/common";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
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

  async writeLocalFile(storageKey: string, content: Buffer): Promise<void> {
    const absoluteFilePath = this.resolveLocalPath(storageKey);
    await mkdir(path.dirname(absoluteFilePath), { recursive: true });
    await writeFile(absoluteFilePath, content);
  }

  async moveLocalFile(tempFilePath: string, storageKey: string): Promise<void> {
    const absoluteTempPath = this.resolveManagedAbsolutePath(tempFilePath);
    const absoluteFilePath = this.resolveLocalPath(storageKey);
    await mkdir(path.dirname(absoluteFilePath), { recursive: true });
    await rename(absoluteTempPath, absoluteFilePath);
  }

  async deleteManagedAbsoluteFile(filePath: string): Promise<void> {
    const absoluteFilePath = this.resolveManagedAbsolutePath(filePath);
    await rm(absoluteFilePath, { force: true });
  }

  async readManagedAbsoluteFile(filePath: string): Promise<Buffer> {
    const absoluteFilePath = this.resolveManagedAbsolutePath(filePath);
    return readFile(absoluteFilePath);
  }

  private resolveLocalPath(storageKey: string): string {
    const absoluteFilePath = path.resolve(appEnv.uploadsDir, storageKey);
    return this.resolveManagedAbsolutePath(absoluteFilePath);
  }

  private resolveManagedAbsolutePath(filePath: string): string {
    const absoluteFilePath = path.resolve(filePath);
    const relativePath = path.relative(appEnv.uploadsDir, absoluteFilePath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      throw new Error(`Refusing to access file outside uploads directory: ${filePath}`);
    }

    return absoluteFilePath;
  }
}
