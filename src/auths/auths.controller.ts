import { Controller, Post, UseGuards, Req, Get, Res } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RefreshTokenGuard } from './strategies/refresh-token.strategy';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from './strategies/google.strategy';
import { SkipResponseInterceptor } from 'src/common/skip-response.interceptor';
import { JwtAuthGuard } from './strategies/jwt.strategy';
import { User } from '@prisma/client';

@Controller('auths')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

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
    const tokens = await this.authsService.create(req.user as CreateAuthDto);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 2,
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
    console.log('refresh/req', req);
    const user = req.user as User;
    const tokens = await this.authsService.refreshToken(+user.id);
    console.log('refresh/tokes', tokens);

    res.cookie('accessToken', tokens.data.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 2,
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
}
