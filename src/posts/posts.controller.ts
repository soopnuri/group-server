import { Controller, Post, Body } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostDto } from './dto/post.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: '포스트 생성' })
  create(@Body() createPostDto: PostDto) {
    return this.postsService.create(createPostDto);
  }

  // @Get()
  // @ApiOperation({ summary: '전체 포스트 가져오기' })
  // findAll() {
  //   return this.postsService.findAll();
  // }

  // @Get(':id')
  // @ApiOperation({ summary: '포스트 가져오기' })
  // findOne(@Param('id') id: string) {
  //   return this.postsService.findOne(+id);
  // }

  // @Patch(':id')
  // @ApiOperation({ summary: '포스트 수정' })
  // update(@Param('id') id: string, @Body() updatePostDto: PostDto) {
  //   return this.postsService.update(+id, updatePostDto);
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: '포스트 삭제' })
  // remove(@Param('id') id: string) {
  //   return this.postsService.remove(+id);
  // }
}
