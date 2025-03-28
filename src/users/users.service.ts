import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async update(UserDto: UserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: UserDto.email,
      },
    });

    if (user) {
      await this.prisma.user.update({
        where: {
          email: UserDto.email,
        },
        data: {
          name: UserDto.name,
          image: UserDto.image,
        },
      });
      return { message: '수정에 성공 했습니다.' };
    } else {
      return { message: '수정에 실패 했습니다.' };
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return { message: '조회에 성공했습니다.', data: users };
  }

  async findOne(number: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: number,
      },
      include: {
        communities: true,
        communityRoles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    return { message: '조회에 성공했습니다.', data: user };
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    await this.prisma.user.delete({
      where: {
        id: id,
      },
    });
    return { message: '삭제에 성공했습니다.' };
  }
}
