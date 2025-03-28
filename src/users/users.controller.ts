import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from 'src/auths/strategies/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch()
  @ApiOperation({ summary: '유저 정보 수정' })
  @ApiResponse({ status: 200, description: '성공', type: UserDto })
  update(@Body() UserDto: UserDto) {
    return this.usersService.update(UserDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '유저 정보 가져오기' })
  @ApiResponse({ status: 200, description: '성공', type: UserDto })
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(+id);
  }

  @Get()
  @ApiOperation({ summary: '전체 유저 정보 가져오기' })
  @ApiResponse({ status: 200, description: '성공', type: UserDto })
  findAll() {
    return this.usersService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({ status: 200, description: '성공', type: UserDto })
  remove(@Param('id') id: number) {
    return this.usersService.remove(+id);
  }
}
