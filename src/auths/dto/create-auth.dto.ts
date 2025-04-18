import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({ name: 'googleId', description: '사용자 구글 UUID' })
  name: string;

  @ApiProperty({ name: 'email', description: '이메일' })
  @IsEmail(
    {},
    {
      message: '이메일 형식이 올바르지 않습니다.',
    },
  )
  email: string;

  @IsString()
  password: string;
}
