import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { StorageModule } from "../storage/storage.module";
import { WordsModule } from "../words/words.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [AuthModule, StorageModule, WordsModule],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
