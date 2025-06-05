"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const nest_winston_1 = require("nest-winston");
exports.default = (0, config_1.registerAs)('logging', () => ({
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    options: {
        transports: [
            new winston.transports.Console({
                level: process.env.LOG_LEVEL || 'info',
                format: winston.format.combine(winston.format.timestamp(), nest_winston_1.utilities.format.nestLike('NestWallet', {
                    prettyPrint: true,
                    colors: true,
                })),
            }),
            new DailyRotateFile({
                level: 'info',
                dirname: process.env.LOG_DIR || 'logs',
                filename: 'application-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxFiles: process.env.LOG_MAX_FILES || '14d',
                format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            }),
            new DailyRotateFile({
                level: 'error',
                dirname: process.env.LOG_DIR || 'logs',
                filename: 'error-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxFiles: process.env.LOG_MAX_FILES || '14d',
                format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            }),
        ],
    },
}));
//# sourceMappingURL=logging.config.js.map