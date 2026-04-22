import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { mkdirSync } from "node:fs";
import * as path from "node:path";
import { appEnv } from "../config/env";
import { ImagesService } from "./images.service";

const { diskStorage } = require("multer");

const IMAGE_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

interface ImportSearchedImageBody {
  mediaUrl?: string;
  thumbnailUrl?: string;
  sourcePageUrl?: string;
  title?: string;
}

@Controller("api/word-images")
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get("search/bing")
  async searchBingImages(@Query("q") query = "") {
    return this.imagesService.searchBingImages(query);
  }

  @Post("upload/:wordId")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: (
          request: { params?: { wordId?: string } },
          _file: { originalname?: string },
          callback: (error: Error | null, destination: string) => void
        ) => {
          const safeWordId = sanitizeWordId(request.params?.wordId || "");
          const destination = path.resolve(appEnv.uploadsDir, "user-images", safeWordId);
          mkdirSync(destination, { recursive: true });
          callback(null, destination);
        },
        filename: (
          _request: unknown,
          file: { originalname?: string; mimetype?: string },
          callback: (error: Error | null, filename: string) => void
        ) => {
          const extension = resolveImageExtension(file.originalname, file.mimetype);
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
          callback(null, fileName);
        }
      }),
      fileFilter: (
        _request: unknown,
        file: { mimetype?: string },
        callback: (error: Error | null, acceptFile: boolean) => void
      ) => {
        if (!file.mimetype?.startsWith("image/")) {
          callback(new BadRequestException("Only image files can be uploaded."), false);
          return;
        }

        callback(null, true);
      },
      limits: {
        fileSize: IMAGE_UPLOAD_MAX_BYTES
      }
    })
  )
  async uploadImage(
    @Param("wordId") wordId: string,
    @UploadedFile()
    uploadedFile?: {
      filename?: string;
      mimetype?: string;
    }
  ) {
    if (!uploadedFile?.filename) {
      throw new BadRequestException("Please choose one image file.");
    }

    const safeWordId = sanitizeWordId(wordId);
    const storageKey = path.posix.join("user-images", safeWordId, uploadedFile.filename);

    return this.imagesService.uploadImage(wordId, {
      storageKey,
      mimetype: uploadedFile.mimetype || "image/jpeg"
    });
  }

  @Post("search/import/:wordId")
  async importSearchedImage(
    @Param("wordId") wordId: string,
    @Body() body: ImportSearchedImageBody
  ) {
    return this.imagesService.importSearchedImage(wordId, {
      mediaUrl: body?.mediaUrl || "",
      thumbnailUrl: body?.thumbnailUrl || "",
      sourcePageUrl: body?.sourcePageUrl || "",
      title: body?.title || ""
    });
  }

  @Patch(":id/delete")
  async deleteImage(@Param("id", ParseIntPipe) imageId: number) {
    return this.imagesService.deleteImage(imageId);
  }

  @Patch(":id/restore")
  async restoreImage(@Param("id", ParseIntPipe) imageId: number) {
    return this.imagesService.restoreImage(imageId);
  }
}

function sanitizeWordId(wordId: string): string {
  const normalizedValue = wordId.trim().replace(/[^a-zA-Z0-9_-]+/g, "-");
  return normalizedValue.replace(/-{2,}/g, "-").replace(/^-|-$/g, "") || "word";
}

function resolveImageExtension(originalName = "", mimeType = ""): string {
  const normalizedExtension = path.extname(originalName).toLowerCase();

  if (normalizedExtension) {
    return normalizedExtension;
  }

  switch (mimeType) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    default:
      return ".jpg";
  }
}
