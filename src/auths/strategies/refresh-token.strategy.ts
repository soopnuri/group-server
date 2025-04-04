import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport'; // AuthGuard import 추가
// import * as bcrypt from 'bcrypt'; // Refresh Token 해싱/비교 시 필요

// --- Refresh Token 쿠키 추출기 ---
const refreshTokenExtractor = (req: Request): string | null => {
  let token = null;
  if (req && req.cookies) {
    // 'refreshToken' 쿠키에서 값을 추출합니다. (쿠키 설정 시 사용한 이름)
    token = req.cookies['refreshToken'];
  }
  console.log(
    'Refresh Token Cookie Extractor - Token found:',
    token ? 'Yes' : 'No',
  );
  return token;
};

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh', // 전략 이름은 'jwt-refresh' 유지
) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: refreshTokenExtractor,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false, // Refresh Token도 만료 검증
      passReqToCallback: true, // validate 메소드에서 req 객체를 사용하기 위해 true 설정
    });
  }

  /**
   * Passport가 Refresh Token 쿠키를 성공적으로 추출하고,
   * Secret Key로 서명과 만료 시간을 검증한 후 호출됩니다.
   * @param req Express Request 객체
   * @param payload 검증된 Refresh Token의 Payload
   */
  async validate(req: Request, payload: any) {
    // 1. Payload에서 사용자 ID 추출
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }
    const userId = payload.sub;

    // 2. DB에서 사용자 정보 조회 (및 저장된 Refresh Token 확인)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // 사용자가 없거나, DB에 저장된 리프레시 토큰이 없는 경우 (로그아웃 처리되었거나 비정상 상태)
    if (!user || !user.refreshToken) {
      // DB에 리프레시 토큰이 없다면, 현재 받은 토큰도 유효하지 않은 것으로 간주하고 오류 처리
      throw new ForbiddenException(
        'Access Denied: No valid refresh token found for user',
      );
    }

    // 3. 요청 쿠키에서 실제 Refresh Token 문자열 다시 가져오기
    //    (refreshTokenExtractor가 반환한 값과 동일해야 함)
    const refreshTokenFromCookie = req.cookies['refreshToken'];
    if (!refreshTokenFromCookie) {
      // 여기까지 왔다면 Passport 검증은 통과했으나 req에서 쿠키를 못 찾는 이상한 상황
      throw new UnauthorizedException(
        'Refresh token cookie not found in request during validation',
      );
    }

    console.log('Received Refresh Token (Cookie):', refreshTokenFromCookie);
    console.log('Stored Refresh Token (DB):', user.refreshToken);

    // 4. DB에 저장된 Refresh Token과 현재 요청의 Refresh Token 비교
    //    보안 강화: DB에는 해시된 토큰을 저장하고 bcrypt.compare 사용하는 것을 강력히 권장
    // const isTokenMatching = await bcrypt.compare(refreshTokenFromCookie, user.refreshToken);

    //    (간단한 비교 - DB에 평문 토큰 저장 시. 보안상 권장되지 않음)
    const isTokenMatching = refreshTokenFromCookie === user.refreshToken;

    console.log('isTokenMatching:', isTokenMatching);

    if (!isTokenMatching) {
      // DB의 값과 일치하지 않으면, 유효하지 않은 토큰으로 간주 (탈취 또는 이전 토큰 사용 시도 등)
      // 보안: 여기서 해당 유저의 모든 세션(DB의 refreshToken 필드 null 처리 등)을 무효화하는 로직 추가 고려
      throw new ForbiddenException('Access Denied: Refresh token mismatch');
    }

    // 5. 모든 검증 통과: 사용자 정보 반환 (필요시 payload나 token 정보 추가 가능)
    //    컨트롤러에서 req.user로 접근 가능하게 됨
    //    Access Token 재발급에 필요한 정보만 반환해도 됨 (예: userId, email 등)
    return {
      id: user.id,
    };
  }
}

// Refresh Token Guard는 이름과 사용하는 전략('jwt-refresh')만 맞으면 그대로 사용 가능
@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {}
