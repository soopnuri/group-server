import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from 'src/prisma.service';
import { UpdatePostDto } from './dto/update-post.dto';

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
    const posts = await this.prisma.post.findMany();

    if (!posts) {
      return { message: '아직 등록된 게시글이 없습니다.' };
    }

    return { message: '게시글을 찾았습니다.', data: posts };
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
