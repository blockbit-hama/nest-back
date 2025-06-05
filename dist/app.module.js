"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const nest_winston_1 = require("nest-winston");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const exception_module_1 = require("./exception/exception.module");
const winston = require("winston");
const path_1 = require("path");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: `.${process.env.NODE_ENV || 'development'}.env`,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const config = {
                        type: 'mysql',
                        host: configService.get('DB_HOST'),
                        port: configService.get('DB_PORT'),
                        username: configService.get('DB_USERNAME'),
                        password: configService.get('DB_PASSWORD'),
                        database: configService.get('DB_DATABASE'),
                        entities: [(0, path_1.join)(__dirname, '**', '*.entity{.ts,.js}')],
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
            nest_winston_1.WinstonModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    transports: [
                        new winston.transports.Console({
                            level: configService.get('LOG_LEVEL', 'debug'),
                            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
                        }),
                        new winston.transports.File({
                            dirname: configService.get('LOG_DIR', 'logs'),
                            filename: 'error.log',
                            level: 'error',
                            maxsize: 10485760,
                            maxFiles: 14,
                            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
                        }),
                    ],
                }),
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            exception_module_1.ExceptionModule,
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map