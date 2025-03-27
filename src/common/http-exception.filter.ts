import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | object;

    if (typeof exceptionResponse === 'object') {
      message = (exceptionResponse as any).message;
    } else {
      message = exceptionResponse;
    }

    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}
