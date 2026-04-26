import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { ImagesModule } from "./images/images.module";
import { StorageModule } from "./storage/storage.module";
import { WordsModule } from "./words/words.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    StorageModule,
    WordsModule,
    AuthModule,
    ImagesModule
  ]
})
export class AppModule {}
