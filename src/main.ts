import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = (
    process.env.FRONTEND_URLS ?? "http://localhost:5173,http://127.0.0.1:5173"
  ).split(",");
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle("Tasks API")
    .setDescription("API para gerenciamento de tarefas!")
    .setVersion("1.0")
    .addTag("users", "Operações relacionadas aos usuários")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  });

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
