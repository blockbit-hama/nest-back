import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 타입 변환 활성화
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 에러
      disableErrorMessages: false, // 프로덕션에서는 true로 설정하여 상세 에러 메시지 숨김
    }),
  );
  await app.listen(3000);
}
bootstrap();
