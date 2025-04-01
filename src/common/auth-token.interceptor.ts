import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

export interface AuthResponseData {
  accessToken: string;
  refreshToken?: string; // 컨트롤러에서는 반환하지만, 인터셉터에서 제거될 것
  user?: any; // 기타 필요한 사용자 정보
  // ... 기타 필요한 데이터
}

@Injectable()
export class AuthTokenInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse<Response>();

    return next.handle().pipe(
      map((responseData: AuthResponseData | any) => {
        const data = responseData.data || responseData;

        if (data && data.accessToken && data.refreshToken) {
          const { refreshToken, ...dataToSend } = data; // refreshToken 분리

          // 1. Refresh Token을 HttpOnly 쿠키로 설정
          response.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송
            sameSite: 'lax', // 또는 'strict', CSRF 방어에 도움
            // expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 예: 7일 유효기간
            path: '/', // 쿠키 사용 경로 (필요시 /auth/refresh 등으로 제한)
          });

          // 2. 응답 본문에서는 refreshToken 제거 후 반환 (AccessToken 등만 포함)
          //    일관된 응답 구조로 래핑할 수도 있음
          return {
            success: true,
            data: dataToSend, // accessToken, user 정보 등 포함
          };
        }

        // 토큰이 없는 경우 (예: 일반적인 데이터 조회 응답)
        // 일관성을 위해 동일한 구조로 래핑할 수 있음
        return { success: true, data: data };
      }),
    );
  }
}
