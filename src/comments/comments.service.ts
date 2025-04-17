import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 게시물에 댓글, 대댓글 생성
   * @param postId
   * @param userId
   * @param createCommentDto
   * @returns 생성된 댓글 객체
   */
  async createComment(
    postId: number,
    userId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const { comment, parentCommentId } = createCommentDto;

    // 1. 게시물 확인
    const postExists = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!postExists) {
      throw new NotFoundException(
        `ID ${postId}에 해당하는 게시물을 찾을 수 없습니다.`,
      );
    }

    // 2. 대댓글인 경우 부모 댓글 유효성 검사
    if (parentCommentId) {
      const parentCommentExists = await this.prisma.comment.findUnique({
        where: { id: parentCommentId },
      });
      if (!parentCommentExists) {
        throw new NotFoundException(
          `ID ${parentCommentId}에 해당하는 댓글을 찾을 수 없습니다.`,
        );
      }

      if (parentCommentExists.postId !== postId) {
        throw new NotFoundException(
          `ID ${parentCommentId}에 해당하는 댓글은 게시물 ID ${postId}에 속하지 않습니다.`,
        );
      }
    }

    // 3. 댓글 생성
    const newComment = await this.prisma.comment.create({
      data: {
        comment,
        postId,
        authorId: userId,
        parentCommentId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return newComment;
  }

  /**
   * 특정 게시물 최상위 댓글 조회(대댓글 포함하지 않음)
   * @param postId
   * @param queryDto 페이징 옵션(page, limit)
   * @returns 최상위 댓글 목록
   */
  async getCommentsByPostId(
    postId: number,
    queryDto: { page: number; limit: number },
  ) {
    const { page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    // 1. 게시물 확인
    const postExists = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!postExists) {
      throw new NotFoundException(
        `ID ${postId}에 해당하는 게시물을 찾을 수 없습니다.`,
      );
    }

    const whereCondition: Prisma.CommentWhereInput = {
      postId,
      parentCommentId: null,
    };

    const [comments, totalCount] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where: whereCondition,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({
        where: whereCondition,
      }),
    ]);

    return {
      data: {
        comments,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  /**
   * 특정 댓글의 대댓글 목록 조회
   * @param parentCommentId 부모 댓글 ID
   * @param queryDto 페이징 옵션(page, limit)
   * @returns 대댓글 목록
   */
  async getRepliesByParentCommentId(
    parentCommentId: number,
    queryDto: { page: number; limit: number },
  ) {
    const { page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    // 1. 부모 댓글 확인
    const parentCommentExists = await this.prisma.comment.findUnique({
      where: { id: parentCommentId },
    });

    if (!parentCommentExists) {
      throw new NotFoundException(
        `ID ${parentCommentId}에 해당하는 댓글을 찾을 수 없습니다.`,
      );
    }

    const whereCondition: Prisma.CommentWhereInput = {
      parentCommentId,
    };

    const [replies, totalCount] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where: whereCondition,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({
        where: whereCondition,
      }),
    ]);
    return {
      data: {
        replies,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  /**
   * 특정 댓글 수정
   * @param commentId
   * @param userId
   * @param updateCommentDto
   * @returns 수정된 댓글 객체
   */
  async updateComment(
    commentId: number,
    userId: number,
    updateCommentDto: UpdateCommentDto,
  ) {
    const { comment } = updateCommentDto;

    // 1. 댓글 확인
    const commentExist = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!commentExist) {
      throw new NotFoundException(
        `ID ${commentId}에 해당하는 댓글을 찾을 수 없습니다.`,
      );
    }

    // 2. 권한 확인
    if (commentExist.authorId !== userId) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: { comment },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });
    return {
      data: updatedComment,
    };
  }

  /**
   * 특정 게시물 댓글과 대댓글 함께 조회
   * @param postId 게시물 ID
   * @param queryDto 페이징 옵션(page, limit)
   * @returns 게시물의 댓글과 대댓글 목록
   */
  async getCommentsAndRepliesByPostId(
    postId: number,
    queryDto: { page: number; limit: number },
  ) {
    const { page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    // 1. 게시물 확인
    const postExists = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!postExists) {
      throw new NotFoundException(
        `ID ${postId}에 해당하는 게시물을 찾을 수 없습니다.`,
      );
    }

    // 2.  최상위 댓글만 필터링하는 조건
    const whereCondition: Prisma.CommentWhereInput = {
      postId,
      parentCommentId: null,
    };

    // 3. 최상위 댓글과 함께 속한 댓글 조회
    const [comments, totalCount] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where: whereCondition,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          replies: {
            include: {
              // 대댓글 작성자 정보 포함
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({
        where: whereCondition,
      }),
    ]);
    return {
      data: {
        comments,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  /**
   * 특정 댓글 삭제
   * @param commentId
   * @param userId
   */
  async deleteComment(commentId: number, userId: number) {
    // 1. 댓글 확인
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(
        `ID ${commentId}에 해당하는 댓글을 찾을 수 없습니다.`,
      );
    }

    // 2. 권한 확인
    // TODO: 커뮤니티 관리자 삭제 권한 로직 추가 필요
    if (comment.authorId !== userId) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    // 3. 댓글 삭제
    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    return {
      message: '정상적으로 삭제되었습니다',
    };
  }
}
