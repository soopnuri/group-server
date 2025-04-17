import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/auths/strategies/jwt.strategy';

interface RequestWithUser extends Request {
  user: { id: number /* 다른 사용자 정보 */ };
}
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * 특정 게시물 댓글 또는 대댓글 작성
   * /posts/:postId
   */
  @UseGuards(JwtAuthGuard)
  @Post(':postId')
  async create(
    @Param('postId') postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.commentsService.createComment(postId, userId, createCommentDto);
  }

  /**
   * 특정 게시물 댓글과 대댓글 조회
   * /posts/:postId/comments?page=1&limit=10
   */
  @Get(':postId/with-replies')
  async getCommentsWithRepliesByPostId(
    @Param('postId') postId: number,
    @Query() queryDto: { page: number; limit: number },
  ) {
    return this.commentsService.getCommentsAndRepliesByPostId(postId, queryDto);
  }

  /**
   * 특정 게시물 최상위 댓글 목록 조회
   * /posts/:postId/comments?page=1&limit=10
   */
  @Get(':postId')
  async getCommentByPostId(
    @Param('postId') postId: number,
    @Query() queryDto: { page: number; limit: number },
  ) {
    return this.commentsService.getCommentsByPostId(postId, queryDto);
  }

  /**
   * 특정 댓글의 대댓글 목록 조회
   * /comments/:commentId/replies?page=1&limit=10
   */
  @Get(':commentId/replies')
  async getRepliesByParentCommentId(
    @Param('commentId') parentCommentId: number,
    @Query() queryDto: { page: number; limit: number },
  ) {
    return this.commentsService.getRepliesByParentCommentId(
      parentCommentId,
      queryDto,
    );
  }

  /**
   * 특정 댓글 수정
   * /comments/:commentId
   */
  @UseGuards(JwtAuthGuard)
  @Patch('comments/:commentId')
  async updateComment(
    @Param('commentId') commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.commentsService.updateComment(
      commentId,
      userId,
      updateCommentDto,
    );
  }

  /**
   * 특정 댓글 삭제
   * /comments/:commentId
   */
  @UseGuards(JwtAuthGuard)
  @Delete('comments/:commentId')
  async deleteComment(
    @Param('commentId') commentId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.commentsService.deleteComment(commentId, userId);
  }
}
