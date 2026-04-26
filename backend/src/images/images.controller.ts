import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
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
import { AuthService } from "../auth/auth.service";
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
  constructor(
    private readonly authService: AuthService,
    private readonly imagesService: ImagesService
  ) {}

  @Get("search/bing")
  async searchBingImages(
    @Query("q") query = "",
    @Headers("authorization") authorization?: string
  ) {
    await this.authService.requireUserFromAuthorization(authorization);
    return this.imagesService.searchBingImages(query);
  }

  @Post("upload/:wordId")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: (
          _request: { params?: { wordId?: string } },
          _file: { originalname?: string },
          callback: (error: Error | null, destination: string) => void
        ) => {
          const destination = path.resolve(appEnv.uploadsDir, "user-images", "_temp");
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
    @Headers("authorization") authorization?: string,
    @UploadedFile()
    uploadedFile?: {
      filename?: string;
      mimetype?: string;
      path?: string;
    }
  ) {
    if (!uploadedFile?.filename || !uploadedFile.path) {
      throw new BadRequestException("Please choose one image file.");
    }

    const user = await this.authService.requireUserFromAuthorization(authorization);

    return this.imagesService.uploadImage(wordId, user, {
      tempFilePath: uploadedFile.path,
      fileName: uploadedFile.filename,
      mimetype: uploadedFile.mimetype || "image/jpeg"
    });
  }

  @Post("search/import/:wordId")
  async importSearchedImage(
    @Param("wordId") wordId: string,
    @Body() body: ImportSearchedImageBody,
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);

    return this.imagesService.importSearchedImage(wordId, user, {
      mediaUrl: body?.mediaUrl || "",
      thumbnailUrl: body?.thumbnailUrl || "",
      sourcePageUrl: body?.sourcePageUrl || "",
      title: body?.title || ""
    });
  }

  @Patch(":id/delete")
  async deleteImage(
    @Param("id", ParseIntPipe) imageId: number,
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.imagesService.deleteImage(imageId, user);
  }

  @Patch(":id/restore")
  async restoreImage(
    @Param("id", ParseIntPipe) imageId: number,
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.imagesService.restoreImage(imageId, user);
  }
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
