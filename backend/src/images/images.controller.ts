import { Controller, Param, ParseIntPipe, Patch } from "@nestjs/common";
import { ImagesService } from "./images.service";

@Controller("api/word-images")
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Patch(":id/delete")
  async deleteImage(@Param("id", ParseIntPipe) imageId: number) {
    return this.imagesService.deleteImage(imageId);
  }

  @Patch(":id/restore")
  async restoreImage(@Param("id", ParseIntPipe) imageId: number) {
    return this.imagesService.restoreImage(imageId);
  }
}
