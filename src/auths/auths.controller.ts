import {
  Controller,
  Post,
  UseGuards,
  Req,
  Get,
  Res,
  Body,
} from '@nestjs/common';
import { AuthsService } from './auths.service';
import { CreateGoogleAuthDto } from './dto/create-google.auth.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RefreshTokenGuard } from './strategies/refresh-token.strategy';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from './strategies/google.strategy';
import { SkipResponseInterceptor } from 'src/common/skip-response.interceptor';
import { JwtAuthGuard } from './strategies/jwt.strategy';
import { User } from '@prisma/client';
import { CreateAuthDto } from './dto/create-auth.dto';

@Controller('auths')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Post('signup')
  @ApiOperation({
    summary: '회원가입',
    description: '회원가입을 합니다.',
  })
  @ApiResponse({ status: 200, description: '성공', type: CreateAuthDto })
  async signup(@Body() createAuthDto: CreateAuthDto) {
    return await this.authsService.signup(createAuthDto);
  }

  @Post('login')
  @ApiOperation({
    summary: '로그인',
    description: '로그인을 합니다.',
  })
  @ApiResponse({ status: 200, description: '성공', type: CreateAuthDto })
  async login(@Body() createAuthDto: CreateAuthDto, @Res() res: Response) {
    const user = await this.authsService.login(createAuthDto);

    if (!user?.data)
      return res.status(401).json({
        message: '비밀번호가 일치하지 않습니다.',
        data: {
          user: user.data,
        },
      });

    const tokens = await this.authsService.getTokens(
      user.data.id,
      user.data.email,
    );

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
      path: '/',
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    return res.status(201).json({
      message: '로그인에 성공했습니다.',
      data: {
        user: user.data,
      },
    });
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @SkipResponseInterceptor()
  async googleAuth() {
    // Google 인증을 위한 라우트
    // 사용자가 Google 로그인 페이지로 리디렉션됩니다.
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @SkipResponseInterceptor()
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authsService.create(
      req.user as CreateGoogleAuthDto,
    );

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
      path: '/',
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    res.redirect('http://localhost:3000');
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({
    summary: '토큰 재발급',
    description: '토큰을 재발급 합니다.',
  })
  @ApiResponse({ status: 200, description: '성공', type: CreateAuthDto })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as User;
    const tokens = await this.authsService.refreshToken(+user.id);

    res.cookie('accessToken', tokens.data.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
      path: '/',
    });

    res.cookie('refreshToken', tokens.data.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    return { message: '토큰 발급에 성공했습니다.' };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: '유저 정보 조회',
    description: '유저 정보를 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '성공', type: CreateAuthDto })
  async getUser(@Req() req: Request) {
    const user = req.user as User;
    return await this.authsService.getUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  @ApiOperation({
    summary: '로그아웃',
    description: '로그아웃 합니다.',
  })
  @ApiResponse({ status: 200, description: '성공' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as User;
    await this.authsService.logout(user.id);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { message: '로그아웃 되었습니다.' };
  }
}
