import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from './error-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : '서버 내부 오류가 발생했습니다.';

    const errorName = exception.name || 'Error';

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message: message,
      error: errorName,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // 개발 환경에서만 스택 트레이스 로깅
    if (process.env.NODE_ENV !== 'production') {
      this.logger.error({
        ...errorResponse,
        stack: exception.stack,
        body: request.body,
        params: request.params,
        query: request.query,
      });
    } else {
      // 프로덕션 환경에서는 민감한 정보 제외하고 로깅
      this.logger.error({
        ...errorResponse,
        method: request.method,
      });
    }

    response.status(status).json(errorResponse);
  }
}
