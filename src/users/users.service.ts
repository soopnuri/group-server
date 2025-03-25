import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async update(UpdateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: UpdateUserDto.email,
      },
    });

    if (user) {
      await this.prisma.user.update({
        where: {
          email: UpdateUserDto.email,
        },
        data: {
          name: UpdateUserDto.name,
          image: UpdateUserDto.image,
        },
      });
      return { message: '수정에 성공 했습니다.' };
    } else {
      return { message: '수정에 실패 했습니다.' };
    }
  }

  async findOne(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      return { message: '조회에 성공했습니다.', data: user };
    } else {
      return { message: '존재하지 않는 유저입니다.' };
    }
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (user) {
      await this.prisma.user.delete({
        where: {
          id: id,
        },
      });
      return { message: '삭제에 성공했습니다.' };
    } else {
      return { message: '삭제에 실패했습니다.' };
    }
  }
}
