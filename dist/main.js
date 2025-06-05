"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const helmet_1 = require("helmet");
const compression = require("compression");
const config_1 = require("@nestjs/config");
const nest_winston_1 = require("nest-winston");
const express_rate_limit_1 = require("express-rate-limit");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
    app.useLogger(app.get(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER));
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: configService
            .get('CORS_ORIGINS', 'http://localhost:3001')
            .split(','),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.use((0, helmet_1.default)());
    app.use(compression());
    app.use((0, express_rate_limit_1.rateLimit)({
        windowMs: configService.get('RATE_LIMIT_TTL', 60) * 1000,
        max: configService.get('RATE_LIMIT_MAX', 100),
        message: 'Too many requests from this IP, please try again later',
    }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: process.env.NODE_ENV === 'production',
        whitelist: true,
    }));
    app.enableShutdownHooks();
    const port = configService.get('PORT', 3000);
    await app.listen(port);
    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
//# sourceMappingURL=main.js.map