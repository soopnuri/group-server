import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JoinCommunityDto } from './dto/join-community-dto';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { Prisma } from '@prisma/client';

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

      const userCommunityCount = await tx.community.count({
        where: {
          creatorId: communityDto.creatorId,
        },
      });

      const MAX_COMMUNITIES_PER_USER = 3; // Define the limit

      if (userCommunityCount >= MAX_COMMUNITIES_PER_USER) {
        throw new BadRequestException(
          `사용자당 최대 ${MAX_COMMUNITIES_PER_USER}개의 커뮤니티만 생성할 수 있습니다.`,
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
          rules: {
            create: communityDto.rules || [],
          },
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
   * 커뮤니티 수정
   */
  async update(id: number, updateDto: UpdateCommunityDto) {
    // 1. 존재 여부 확인
    const exists = await this.prisma.community.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('커뮤니티가 존재하지 않습니다.');
    }

    const { rules: dtoRules, ...communityDataToUpdate } = updateDto;

    // 2. 업데이트할 데이터 객체 생성
    const updateData: Prisma.CommunityUpdateInput = {
      ...communityDataToUpdate, // description 등 스칼라 필드 먼저 복사
    };

    // 3. rules 필드가 DTO에 제공된 경우, 관계 업데이트 로직 추가
    if (dtoRules !== undefined) {
      updateData.rules = {
        // 이 커뮤니티에 연결된 기존의 모든 규칙 삭제
        deleteMany: {}, // 빈 필터 {}는 해당 커뮤니티와 관련된 모든 레코드를 대상으로 함
        // DTO에서 제공된 새 규칙들 생성
        create: dtoRules.map((rule) => ({
          title: rule.title,
          description: rule.description,
        })),
      };
    } else {
      // 선택 사항: dtoRules가 명시적으로 null이거나 빈 배열일 경우 처리
      // 예: rules 필드가 null이나 빈 배열로 오면 모든 규칙을 삭제하려는 경우
      if (
        dtoRules === null ||
        (Array.isArray(dtoRules) && dtoRules.length === 0)
      ) {
        updateData.rules = {
          deleteMany: {},
        };
      }
    }

    // 4. 업데이트 실행
    try {
      const updatedCommunity = await this.prisma.community.update({
        where: { id: id },
        data: updateData,
        include: {
          // include를 사용하여 업데이트된 rule 정보도 함께 반환
          rules: {
            select: {
              title: true,
              description: true,
            },
          },
        },
      });

      return {
        message: '커뮤니티 수정에 성공했습니다.',
        data: updatedCommunity,
      };
    } catch (error) {
      // 필요한 경우 더 구체적인 오류 처리 추가
      console.error('커뮤니티 업데이트 중 오류 발생:', error);
      throw new Error('커뮤니티 업데이트에 실패했습니다.'); // 또는 더 구체적인 HTTP 예외
    }
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
