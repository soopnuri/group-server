import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class AuthTokenInterceptor implements NestInterceptor {
  /**
   * 1. 요청을 수신한다.
   * 2. Interceptor 가 먼저 실행된다.
   * 3. next.handle() 로 위임을 한다. 다음 처리 단계 즉
   *    this.authsService.create(createAuthDto)를 실행한다.
   * 4. next.handle() 의 반환값을 받아서 처리한다.
   * 5. 여기서 data 는 authsService.create(createAuthDto) 의 반환값이다.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Controller 핸들러 실행 후 반환되는 데이터 스트림 (Observable)
    return next.handle().pipe(
      map(({ data }) => {
        if (data && data.accessToken && data.refreshToken) {
          const response = context.switchToHttp().getResponse<Response>();
          const { user, accessToken, refreshToken } = data;
          // 쿠키 설정
          response.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 1, // 1일
            path: '/',
          });

          response.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, // Refresh Token은 보통 Secure 설정
            path: '/auths/refresh',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
          });

          return { data: user };
        }
        return data;
      }),
    );
  }
}
