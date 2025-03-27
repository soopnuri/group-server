import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JoinCommunityDto } from './dto/join-community-dto';
import { CreateCommunityDto } from './dto/create-community.dto';

@Injectable()
export class CommunitiesService {
  constructor(private prisma: PrismaService) {}

  /**
   * 커뮤니티 생성
   * @param communityDto
   */
  async create(communityDto: CreateCommunityDto) {
    // 여러 DB 작업중 하나라도 실패할 경우 rollback
    // this.prisma 대신 callback tx 사용
    return this.prisma.$transaction(async (tx) => {
      const existingCommunity = await tx.community.findUnique({
        where: {
          slug: communityDto.slug,
        },
      });

      if (existingCommunity) {
        throw new BadRequestException(
          `이미 ${existingCommunity.slug} 는 사용 중입니다.`,
        );
      }

      // role 이 없을 경우 에러 처리
      const roleToAssign = await tx.role.findUnique({
        where: { name: 'admin' },
      });

      if (!roleToAssign) {
        throw new InternalServerErrorException('서버로 문의해 주세요.');
      }

      await tx.community.create({
        data: {
          creatorId: communityDto.creatorId,
          name: communityDto.name,
          description: communityDto.description,
          slug: communityDto.slug,
          // 커뮤니티 생성시 멤버 추가
          members: {
            connect: {
              id: communityDto.creatorId,
            },
          },
          // 커뮤니티 생성시 관리자 권한을 부여
          communityRoles: {
            create: {
              user: {
                connect: {
                  id: communityDto.creatorId,
                },
              },
              role: {
                connect: {
                  id: roleToAssign.id,
                },
              },
            },
          },
        },
      });

      return { message: '커뮤니티 생성에 성공했습니다.' };
    });
  }

  /**
   * 커뮤니티 전체 조회
   */
  async findAll() {
    return await this.prisma.community.findMany();
  }

  /**
   * 특정 커뮤니티 조회
   * TODO: 검색 기능?
   * @param id
   */
  async findOne(id: number) {
    const checkCommunity = await this.prisma.community.findUnique({
      where: {
        id: id,
      },
      include: {
        members: true,
        communityRoles: {
          select: {
            userId: true,
            user: {
              select: {
                name: true,
                id: true,
              },
            },
            role: {
              select: {
                name: true,
                permissions: true,
              },
            },
          },
        },
      },
    });

    if (!checkCommunity) {
      throw new BadRequestException('존재하지 않는 커뮤니티입니다.');
    }

    return { message: '조회에 성공했습니다.', data: checkCommunity };
  }

  /**
   * 커뮤니티 가입
   * @param JoinCommunityDto
   * @returns
   */
  async join(joinDto: JoinCommunityDto) {
    const community = await this.prisma.community.findUnique({
      where: {
        id: joinDto.communityId,
      },
      include: {
        members: true,
      },
    });

    if (!community) {
      throw new BadRequestException('존재하지 않는 커뮤니티입니다.');
    }

    if (community.members.some((member) => member.id === joinDto.userId)) {
      throw new BadRequestException('이미 가입된 커뮤니티입니다.');
    }

    await this.prisma.community.update({
      where: {
        id: joinDto.communityId,
      },
      data: {
        members: {
          connect: { id: joinDto.userId },
        },
      },
    });

    return { message: '커뮤니티 가입에 성공했습니다.' };
  }
}
