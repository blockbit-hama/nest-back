import { registerAs } from '@nestjs/config';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

export default registerAs('logging', () => ({
  level: process.env.LOG_LEVEL || 'info',
  dir: process.env.LOG_DIR || 'logs',
  maxFiles: process.env.LOG_MAX_FILES || '14d',

  // Winston 설정
  options: {
    transports: [
      // 콘솔 출력
      new winston.transports.Console({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          nestWinstonModuleUtilities.format.nestLike('NestWallet', {
            prettyPrint: true,
            colors: true,
          }),
        ),
      }),

      // 일반 로그 파일
      new DailyRotateFile({
        level: 'info',
        dirname: process.env.LOG_DIR || 'logs',
        filename: 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: process.env.LOG_MAX_FILES || '14d',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),

      // 에러 로그 파일
      new DailyRotateFile({
        level: 'error',
        dirname: process.env.LOG_DIR || 'logs',
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: process.env.LOG_MAX_FILES || '14d',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ],
  },
}));
