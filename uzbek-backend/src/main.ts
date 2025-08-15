import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common/pipes/validation.pipe";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
bootstrap().catch((err) => {
  console.error("Bootstrap failed:", err);
  process.exit(1);
});
