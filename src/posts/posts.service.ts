import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from 'src/prisma.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto) {
    const newPost = await this.prisma.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        authorId: createPostDto.authorId,
        communityId: createPostDto.communityId,
      },
    });

    if (!newPost) {
      throw new BadRequestException('게시글 생성에 실패했습니다.');
    }

    return { message: '게시글 생성에 성공했습니다.' };
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      throw new BadRequestException('게시글을 찾을 수 없습니다.');
    }

    return { message: '게시글을 찾았습니다.', data: post };
  }

  async findAll() {
    const posts = await this.prisma.post.findMany({
      include: {
        community: true,
      },
    });

    if (!posts) {
      return { message: '아직 등록된 게시글이 없습니다.' };
    }

    return { message: '게시글을 찾았습니다.', data: posts };
  }

  async findAllByCommunitySlug(
    communitySlug: string,
  ): Promise<{ message: string; data?: Post[] }> {
    // 1. Slug로 Community 찾기 (Community 모델에 unique 한 slug 필드가 있다고 가정)
    const community = await this.prisma.community.findUnique({
      where: { slug: communitySlug },
    });

    if (!community) {
      // return { message: `슬러그 '${communitySlug}'에 해당하는 커뮤니티를 찾을 수 없습니다.` };
      throw new NotFoundException(
        `슬러그 '${communitySlug}'에 해당하는 커뮤니티를 찾을 수 없습니다.`,
      );
    }

    // 2. 찾은 Community ID로 게시글 조회 (기존 메서드 재사용 또는 직접 조회)
    // return this.findAllByCommunity(community.id); // 기존 메서드 재사용 시

    // 또는 직접 조회:
    const posts = await this.prisma.post.findMany({
      where: { communityId: community.id },
      include: { community: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!posts || posts.length === 0) {
      return {
        message: `커뮤니티 '${community.name}'에 등록된 게시글이 없습니다.`,
      };
    }
    return {
      message: `커뮤니티 '${community.name}'의 게시글 목록을 조회했습니다.`,
      data: posts,
    };
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      throw new BadRequestException('게시글을 찾을 수 없습니다.');
    }

    const newPost = await this.prisma.post.update({
      where: {
        id,
      },
      data: {
        title: updatePostDto.title,
        content: updatePostDto.content,
      },
    });

    return { message: '게시글 수정에 성공했습니다.', data: newPost };
  }

  async remove(id: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    await this.prisma.post.delete({
      where: {
        id,
      },
    });

    return { message: '게시글 삭제에 성공했습니다.' };
  }
}
