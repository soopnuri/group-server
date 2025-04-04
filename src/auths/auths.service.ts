import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    let user = await this.prisma.user.findUnique({
      where: {
        email: createAuthDto.email,
      },
    });

    if (user) {
      user = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: createAuthDto.name,
          image: createAuthDto.image,
        },
      });
    } else {
      await this.prisma.user.create({
        data: {
          googleId: createAuthDto.googleId,
          email: createAuthDto.email,
          name: createAuthDto.name,
          image: createAuthDto.image,
        },
      });
    }

    const tokens = await this.getTokens(user.id, user.email);
    if (tokens) {
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken: tokens.refreshToken,
        },
      });
    }

    return {
      ...tokens,
    };
  }

  async getUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        image: true,
        name: true,
      },
    });

    return { data: user };
  }

  async getTokens(userId: number, email: string) {
    const accessTokenPayload = { sub: userId, email: email };
    const refreshTokenPayload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: 1 * 60,
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.getTokens(user.id, user.email);

    console.log('tokens-최신업데이트', tokens);
    if (tokens) {
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken: tokens.refreshToken,
        },
      });
    }

    return { data: tokens };
  }
}
