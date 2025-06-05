import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
declare const _default: (() => {
    level: string;
    dir: string;
    maxFiles: string;
    options: {
        transports: (DailyRotateFile | winston.transports.ConsoleTransportInstance)[];
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    level: string;
    dir: string;
    maxFiles: string;
    options: {
        transports: (DailyRotateFile | winston.transports.ConsoleTransportInstance)[];
    };
}>;
export default _default;
