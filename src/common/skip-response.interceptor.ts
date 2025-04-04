import { SetMetadata } from '@nestjs/common';

// 메타데이터 키 정의 (중복 방지를 위해 심볼이나 상수로 관리하는 것이 좋음)
export const SKIP_RESPONSE_INTERCEPTOR = 'skipResponseInterceptor';

// 데코레이터 함수 정의
export const SkipResponseInterceptor = () =>
  SetMetadata(SKIP_RESPONSE_INTERCEPTOR, true);
