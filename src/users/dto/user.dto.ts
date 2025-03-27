import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UserDto {
  @ApiProperty({ name: 'id', description: '고유 아이디' })
  id: string;

  @ApiProperty({ name: 'name', description: '이름' })
  @IsString()
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
  @IsOptional()
  @ApiProperty({
    name: 'image',
    description: '사용자 프로필 이미지',
    required: false,
  })
  image: string;
}
