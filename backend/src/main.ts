import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "node:path";
import { AppModule } from "./app.module";
import { appEnv } from "./config/env";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: true,
    credentials: false
  });

  app.useStaticAssets(join(appEnv.uploadsDir), {
    prefix: "/uploads/"
  });

  await app.listen(appEnv.port);
  console.log(`Word Image Memo API listening on ${appEnv.publicBaseUrl}`);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
