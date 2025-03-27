import { Controller, Body, Post } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auths')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Post('google/login')
  @ApiOperation({
    summary: '구글 회원가입',
    description: '사용자 정보를 추가합니다.',
  })
  @ApiResponse({ status: 200, description: '성공', type: CreateAuthDto })
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authsService.create(createAuthDto);
  }
}
