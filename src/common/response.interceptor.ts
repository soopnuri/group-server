import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    // Controller 핸들러 실행 후 반환되는 데이터 스트림 (Observable)
    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: data.message || '요청에 성공했습니다.',
        data: data.data || {},
      })),
    );
  }
}
