import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "node:path";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { APP_API_DISPLAY_NAME } from "./config/branding";
import { appEnv, getRequiredDatabaseUrl } from "./config/env";
import { ensureDatabaseSchemaReady } from "./database/schema";

async function bootstrap() {
  console.log("Ensuring database schema is up to date...");
  await ensureDatabaseSchemaReady(getRequiredDatabaseUrl(), {
    log: (message) => console.log(message)
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: true,
    credentials: false
  });
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useStaticAssets(join(appEnv.uploadsDir), {
    prefix: "/uploads/"
  });

  await app.listen(appEnv.port);
  console.log(`${APP_API_DISPLAY_NAME} listening on ${appEnv.publicBaseUrl}`);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
