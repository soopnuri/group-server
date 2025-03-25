import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthsService {
  constructor(private prisma: PrismaService) {}

  async create(createAuthDto: CreateAuthDto) {
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
          image: createAuthDto.image,
        },
      });

      return { message: '가입에 성공 했습니다.' };
    } else {
      return { message: '이미 가입된 이메일 입니다.' };
    }
  }
}
