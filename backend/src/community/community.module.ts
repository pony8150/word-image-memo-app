import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { WordsModule } from "../words/words.module";
import { StorageModule } from "../storage/storage.module";
import { CommunityController } from "./community.controller";
import { CommunityService } from "./community.service";

@Module({
  imports: [AuthModule, DatabaseModule, StorageModule, WordsModule],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService]
})
export class CommunityModule {}
