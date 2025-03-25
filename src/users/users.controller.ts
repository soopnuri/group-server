import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch()
  @ApiResponse({ status: 200, description: '성공', type: UpdateUserDto })
  update(@Body() createAuthDto: UpdateUserDto) {
    return this.usersService.update(createAuthDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: '성공', type: UpdateUserDto })
  findOne(@Query('email') email: string) {
    return this.usersService.findOne(email);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: '성공', type: UpdateUserDto })
  remove(@Param('id') id: number) {
    return this.usersService.remove(+id);
  }
}
