import { ArgumentsHost, ExceptionFilter, Logger } from '@nestjs/common';
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger;
    constructor(logger: Logger);
    catch(exception: Error, host: ArgumentsHost): void;
}
