import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExceptionModule } from './exception/exception.module';
import * as winston from 'winston';
import { join } from 'path';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV || 'development'}.env`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): MysqlConnectionOptions => {
        const config: MysqlConnectionOptions = {
          type: 'mysql' as const,
          host: configService.get('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [join(__dirname, '**', '*.entity{.ts,.js}')],
          synchronize: configService.get('NODE_ENV') !== 'production',
          logging: configService.get('NODE_ENV') === 'development',
          charset: 'utf8mb4',
        };

        console.log('Database Config:', {
          host: config.host,
          port: config.port,
          username: config.username,
          database: config.database,
        });

        return config;
      },
    }),
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transports: [
          new winston.transports.Console({
            level: configService.get('LOG_LEVEL', 'debug'),
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
          new winston.transports.File({
            dirname: configService.get('LOG_DIR', 'logs'),
            filename: 'error.log',
            level: 'error',
            maxsize: 10485760, // 10MB
            maxFiles: 14,
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
        ],
      }),
    }),
    AuthModule,
    UsersModule,
    ExceptionModule,
  ],
})
export class AppModule {}
