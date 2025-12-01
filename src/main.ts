import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 AÑADE ESTO
  app.enableCors({
    origin: "*",       // permite peticiones desde cualquier origen
    methods: "GET,POST,PUT,DELETE",
    credentials: false
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
