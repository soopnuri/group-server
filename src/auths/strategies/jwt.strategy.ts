import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma.service';
// AuthGuard는 strategy 자체 파일보다는 사용하는 곳(컨트롤러 등)에서 import합니다.
import { ConfigService } from '@nestjs/config';
import { Request } from 'express'; // Request 타입을 명시적으로 import

// 쿠키에서 JWT를 추출하는 함수 정의
const cookieExtractor = (req: Request): string | null => {
  let token = null;
  if (req && req.cookies) {
    // 'accessToken'은 백엔드에서 쿠키를 설정할 때 사용한 이름이어야 합니다.
    token = req.cookies['accessToken'];
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // validate 메소드는 동일하게 payload를 받습니다.
  // Passport가 cookieExtractor로 토큰을 얻고 검증한 후, payload를 여기에 전달합니다.
  async validate(payload: any) {
    // req 객체가 필요하면 validate(req: Request, payload: any) 시그니처를 사용하고 super에 passReqToCallback: true 설정 필요

    // payload.sub (또는 백엔드에서 JWT 생성 시 사용한 사용자 ID 키)를 사용
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub, // payload에 포함된 사용자 ID로 조회
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found based on token');
    }

    // console.log('JwtStrategy validate successful for user:', user.id);
    // 여기서 반환된 user 객체는 요청 객체(req.user)에 자동으로 첨부됩니다.
    return user;
  }
}

// JwtAuthGuard는 그대로 사용 가능합니다. 내부적으로 'jwt' 전략을 실행합니다.
// import { AuthGuard } from '@nestjs/passport'; // 필요한 곳에서 import
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
