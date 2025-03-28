import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies['refreshToken'];
        }
        return token;
      },
      ignoreExpiration: false, // 토큰 만료 확인은 계속 유지
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      throw new UnauthorizedException('유저를 찾을 수 없습니다.');
    }

    let refreshToken: string | undefined;

    if (req.cookies.refreshToken) {
      refreshToken = req.cookies.refreshToken;
    }

    const isTokenMatching = refreshToken === user.refreshToken;

    if (!isTokenMatching) {
      throw new UnauthorizedException('Refresh token not matching');
    }

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found in request');
    }

    return { ...user, refreshToken };
  }
}

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {}
