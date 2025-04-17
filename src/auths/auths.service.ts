import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateGoogleAuthDto } from './dto/create-google.auth.dto';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';
@Injectable()
export class AuthsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async create(createAuthDto: CreateGoogleAuthDto) {
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

  async signup(createAuthDto: CreateAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: createAuthDto.email,
      },
    });

    if (!user) {
      await this.prisma.user.create({
        data: {
          email: createAuthDto.email,
          name: createAuthDto.name,
          password: await bcrypt.hash(createAuthDto.password, 10),
        },
      });
    } else {
      return { message: '이미 가입된 이메일입니다.' };
    }

    return { message: '회원가입에 성공했습니다.' };
  }

  async login(createAuthDto: CreateAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: createAuthDto.email,
      },
    });

    const isValid = await bcrypt.compare(
      createAuthDto.password,
      user?.password,
    );

    if (!isValid) {
      return { message: '비밀번호가 일치하지 않습니다.' };
    }

    if (!user) {
      return { message: '가입되지 않은 이메일입니다.' };
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
      message: '로그인에 성공했습니다.',
      data: user,
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
        expiresIn: 1 * 60 * 60,
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

  async logout(userId: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: null,
      },
    });
  }
}
