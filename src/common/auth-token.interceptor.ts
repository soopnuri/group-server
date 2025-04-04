import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
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
    // const httpContext = context.switchToHttp();
    // const response = httpContext.getResponse<Response>();

    return next.handle().pipe(
      map((responseData: AuthResponseData | any) => {
        const data = responseData.data || responseData;
        console.log('토큰을 제공합니다.', data);

        // if (data && data.accessToken && data.refreshToken) {
        // refreshToken 분리

        // 1. Refresh Token을 HttpOnly 쿠키로 설정
        // secure: HTTPS에서만 전송
        // sameSite: 'lax', // 또는 'strict', CSRF 방어에 도움
        // path: 쿠키 사용 경로 (필요시 /auth/refresh 등으로 제한)
        // response.cookie('refreshToken', refreshToken, {
        //   httpOnly: true,
        //   secure: process.env.NODE_ENV === 'production',
        //   sameSite: 'lax',
        //   path: '/',
        // });

        // 2. 응답 본문에서는 refreshToken 제거 후 반환 (AccessToken 등만 포함)
        //   return {
        //     success: true,
        //     data: data,
        //   };
        // }

        return { success: true, data: data };
      }),
    );
  }
}
