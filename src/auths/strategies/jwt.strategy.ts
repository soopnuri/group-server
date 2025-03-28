import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      // jwtFromRequest 옵션을 커스텀 함수로 변경
      jwtFromRequest: (req: Request) => {
        let token = null;
        // 요청(req) 객체와 쿠키(req.cookies)가 존재하는지 확인
        if (req && req.cookies) {
          // 'accessToken'이라는 이름의 쿠키 값을 가져옵니다.
          // 이전 인터셉터에서 설정한 쿠키 이름과 일치해야 합니다.
          token = req.cookies['accessToken'];
        }
        return token; // 추출된 토큰 (없으면 null) 반환
      },
      ignoreExpiration: false, // 토큰 만료 확인은 계속 유지
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
    // JWT Bearer 토큰을 사용하는 경우
    // super({
    //   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    //   ignoreExpiration: false, // 자동으로 토큰 만료를 확인한다.
    //   secretOrKey: configService.get<string>('JWT_SECRET'),
    // });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      throw new UnauthorizedException('유저를 찾을 수 없습니다.');
    }

    const { ...result } = user;
    return result;
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
