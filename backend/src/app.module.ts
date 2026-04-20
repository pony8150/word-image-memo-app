import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { DatabaseModule } from "./database/database.module";
import { ImagesModule } from "./images/images.module";
import { StorageModule } from "./storage/storage.module";
import { WordsModule } from "./words/words.module";

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule, StorageModule, WordsModule, ImagesModule]
})
export class AppModule {}
