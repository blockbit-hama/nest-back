import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { rateLimit } from 'express-rate-limit';

async function bootstrap() {
  // 앱 생성
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Winston 로거 사용
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // 전역 프리픽스 설정
  app.setGlobalPrefix('api');

  // CORS 설정
  app.enableCors({
    origin: configService
      .get('CORS_ORIGINS', 'http://localhost:3001')
      .split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Security 미들웨어
  app.use(helmet()); // 보안 헤더 설정
  app.use(compression()); // 응답 압축

  // Rate limiting 설정
  app.use(
    rateLimit({
      windowMs: configService.get('RATE_LIMIT_TTL', 60) * 1000, // default 1 minute
      max: configService.get('RATE_LIMIT_MAX', 100), // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later',
    }),
  );

  // Validation 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 타입 변환 활성화
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 에러
      disableErrorMessages: process.env.NODE_ENV === 'production', // 프로덕션에서는 true로 설정하여 상세 에러 메시지 숨김
      whitelist: true, // DTO에 정의되지 않은 속성 제거
    }),
  );

  // Graceful shutdown 설정
  app.enableShutdownHooks();

  // 서버 시작
  const port = configService.get('PORT', 3000);
  await app.listen(port);

  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
