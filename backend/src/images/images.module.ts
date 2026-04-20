import { Module } from "@nestjs/common";
import { WordsModule } from "../words/words.module";
import { ImagesCleanupService } from "./images.cleanup.service";
import { ImagesController } from "./images.controller";
import { ImagesService } from "./images.service";

@Module({
  imports: [WordsModule],
  controllers: [ImagesController],
  providers: [ImagesService, ImagesCleanupService],
  exports: [ImagesService]
})
export class ImagesModule {}
