import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // O'zbekiston/Toshkent vaqt mintaqasini o'rnatish
  process.env.TZ = 'Asia/Tashkent';

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Static fayllarni (masalan, rasmlarni) ochiq qilish '/uploads' url orqali
  app.useStaticAssets(join(__dirname, '..', 'ProductPhoto'), {
    prefix: '/ProductPhoto/',
  });

  // CORS qismiga ruxsat berish
  app.enableCors({
    origin: ['http://localhost:3000', 'https://nuvita.uz', 'https://www.nuvita.uz'], // frontend
    credentials: true,
  });

  // Global API prefix qo'shish
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
