import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from 'src/prisma.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { Community, Post } from '@prisma/client';
import { UpdateVoteDto } from './dto/update-vote.dto';
interface PostWithVoteScore extends Post {
  voteScore: number;
  community: Community; // include 했으므로 타입 명시
  _count?: {
    comments?: number;
  };
}
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
      include: {
        community: {
          select: {
            slug: true,
          },
        },
        comments: {
          where: { parentCommentId: null },
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            replies: {
              orderBy: { createdAt: 'asc' },
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    const voteCount = await this.prisma.vote.aggregate({
      // by: ['postId', 'value'],
      where: {
        postId: post.id,
      },
      _sum: {
        value: true,
      },
    });

    const voteWithPost = {
      ...post,
      voteScore: voteCount._sum.value ?? 0,
    };

    if (!post) {
      throw new BadRequestException('게시글을 찾을 수 없습니다.');
    }

    return { message: '게시글을 찾았습니다.', data: voteWithPost };
  }

  async findAll() {
    const posts = await this.prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        community: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    const postIds = posts.map((post) => post.id);

    const voteCounts = await this.prisma.vote.groupBy({
      by: ['postId', 'value'],
      where: {
        postId: {
          in: postIds,
        },
      },
      _count: {
        _all: true,
      },
    });

    const postScoresMap = new Map<number, number>();

    voteCounts.forEach((group) => {
      const currentScore = postScoresMap.get(group.postId) || 0;
      const scoreChange =
        group.value === 1 ? group._count._all : -group._count._all;
      postScoresMap.set(group.postId, currentScore + scoreChange);
    });

    const postsWithScores: PostWithVoteScore[] = posts.map((post) => {
      const score = postScoresMap.get(post.id) || 0;
      return {
        ...post,
        voteScore: score,
      };
    });

    if (!posts) {
      return { message: '아직 등록된 게시글이 없습니다.' };
    }

    return { message: '게시글을 찾았습니다.', data: postsWithScores };
  }

  async findAllByCommunitySlug(
    communitySlug: string,
  ): Promise<{ message: string; data?: Post[] }> {
    const community = await this.prisma.community.findUnique({
      where: { slug: communitySlug },
    });

    if (!community) {
      throw new NotFoundException(
        `슬러그 '${communitySlug}'에 해당하는 커뮤니티를 찾을 수 없습니다.`,
      );
    }

    // 또는 직접 조회:
    const posts = await this.prisma.post.findMany({
      where: { communityId: community.id },
      include: { community: true, _count: { select: { comments: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const postIds = posts.map((post) => post.id);

    const voteCounts = await this.prisma.vote.groupBy({
      by: ['postId', 'value'],
      where: {
        postId: {
          in: postIds,
        },
      },
      _count: {
        _all: true,
      },
    });

    const postScoresMap = new Map<number, number>();

    voteCounts.forEach((group) => {
      const currentScore = postScoresMap.get(group.postId) || 0;
      const scoreChange =
        group.value === 1 ? group._count._all : -group._count._all;
      postScoresMap.set(group.postId, currentScore + scoreChange);
    });

    const postsWithScores: PostWithVoteScore[] = posts.map((post) => {
      const score = postScoresMap.get(post.id) || 0;
      return {
        ...post,
        voteScore: score,
      };
    });

    if (!posts || posts.length === 0) {
      return {
        message: `커뮤니티 '${community.name}'에 등록된 게시글이 없습니다.`,
      };
    }
    return {
      message: `커뮤니티 '${community.name}'의 게시글 목록을 조회했습니다.`,
      data: postsWithScores,
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

  async votePost(postId: number, updateVoteDto: UpdateVoteDto) {
    if (updateVoteDto.vote !== 1 && updateVoteDto.vote !== -1) {
      throw new BadRequestException('잘못된 요청입니다.');
    }

    const postExists = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
      },
    });

    if (!postExists) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const existingVote = await this.prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId: updateVoteDto.userId,
          postId,
        },
      },
    });

    let userVoteValue: number | null = null;

    if (existingVote) {
      if (existingVote.value === updateVoteDto.vote) {
        await this.prisma.vote.delete({
          where: {
            userId_postId: {
              userId: updateVoteDto.userId,
              postId,
            },
          },
        });
        userVoteValue = null;
      } else {
        const updatedVote = await this.prisma.vote.update({
          where: {
            userId_postId: {
              userId: updateVoteDto.userId,
              postId,
            },
          },
          data: {
            value: updateVoteDto.vote,
          },
        });
        userVoteValue = updatedVote.value;
      }
    } else {
      const newVote = await this.prisma.vote.create({
        data: {
          userId: updateVoteDto.userId,
          postId,
          value: updateVoteDto.vote,
        },
      });
      userVoteValue = newVote.value;
    }

    const res = await this.prisma.vote.aggregate({
      where: {
        postId,
      },
      _sum: {
        value: true,
      },
    });

    const score = res._sum.value || 0;

    return { message: '투표 완료', data: { score, userVoteValue } };
  }
}
