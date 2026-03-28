import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://nuvita.uz',
  'https://www.nuvita.uz',
];

function getAllowedOrigins() {
  const configuredOrigins = process.env.FRONTEND_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return configuredOrigins?.length ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS;
}

async function bootstrap() {
  process.env.TZ = 'Asia/Tashkent';

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  // Static assets should be served under /api/ProductPhoto to match API_BASE_URL
  app.useStaticAssets(join(__dirname, '..', 'ProductPhoto'), {
    prefix: '/api/ProductPhoto/',
  });

  app.enableCors({
    origin: getAllowedOrigins(),
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
