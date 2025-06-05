import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
declare const _default: (() => {
    level: string;
    dir: string;
    maxFiles: string;
    options: {
        transports: (winston.transports.ConsoleTransportInstance | DailyRotateFile)[];
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    level: string;
    dir: string;
    maxFiles: string;
    options: {
        transports: (winston.transports.ConsoleTransportInstance | DailyRotateFile)[];
    };
}>;
export default _default;
