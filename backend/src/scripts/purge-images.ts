import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { ImagesCleanupService } from "../images/images.cleanup.service";

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["error", "warn", "log"]
  });

  try {
    const cleanupService = app.get(ImagesCleanupService);
    const purgedCount = await cleanupService.purgeDueImages();
    console.log(`Purged ${purgedCount} image(s).`);
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
