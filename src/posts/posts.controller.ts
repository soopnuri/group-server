import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  Delete,
  UseGuards,
  // UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auths/strategies/jwt.strategy';
import { UpdateVoteDto } from './dto/update-vote.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '게시글 생성' })
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 게시글 가져오기' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Get()
  @ApiOperation({ summary: '전체 게시글 가져오기' })
  findAll(): any {
    return this.postsService.findAll();
  }

  @Get('community/:slug')
  async getPostByCommunitySlug(@Param('slug') slug: string) {
    return this.postsService.findAllByCommunitySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '포스트 수정' })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '포스트 삭제' })
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '포스트 추천' })
  vote(@Param('id') postId: string, @Body() updateVoteDto: UpdateVoteDto) {
    const voteDto = {
      userId: +updateVoteDto.userId,
      vote: +updateVoteDto.vote,
    };
    return this.postsService.votePost(+postId, voteDto as UpdateVoteDto);
  }
}
