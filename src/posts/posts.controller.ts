import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: '게시글 생성' })
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '게시글 가져오기' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Get()
  @ApiOperation({ summary: '전체 게시글 가져오기' })
  findAll() {
    return this.postsService.findAll();
  }

  @Patch(':id')
  @ApiOperation({ summary: '포스트 수정' })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '포스트 삭제' })
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
