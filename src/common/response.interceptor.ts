import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { SKIP_RESPONSE_INTERCEPTOR } from './skip-response.interceptor';
import { Reflector } from '@nestjs/core';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const skipInterceptor = this.reflector.getAllAndOverride<boolean>(
      SKIP_RESPONSE_INTERCEPTOR,
      [
        context.getHandler(), // 핸들러 레벨 확인
        context.getClass(), // 클래스 레벨 확인 (선택 사항)
      ],
    );

    if (skipInterceptor) {
      return next.handle();
    }

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
