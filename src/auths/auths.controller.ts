import {
  Controller,
  Body,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthsService } from './auths.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthTokenInterceptor } from 'src/common/auth-token.interceptor';
import { RefreshTokenGuard } from './strategies/refresh-token.strategy';

@Controller('auths')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Post('google/login')
  @UseInterceptors(AuthTokenInterceptor)
  @ApiOperation({
    summary: '구글 회원가입',
    description: '사용자 정보를 추가합니다.',
  })
  @ApiResponse({ status: 200, description: '성공', type: CreateAuthDto })
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authsService.create(createAuthDto);
  }

  @UseGuards(RefreshTokenGuard)
  @UseInterceptors(AuthTokenInterceptor)
  @Post('refresh')
  @ApiOperation({
    summary: '토큰 재발급',
    description: '토큰을 재발급 합니다.',
  })
  @ApiResponse({ status: 200, description: '성공', type: CreateAuthDto })
  refreshToken(@Body() body: any) {
    return this.authsService.refreshToken(body.id);
  }
}
