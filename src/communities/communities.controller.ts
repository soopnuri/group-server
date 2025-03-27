import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { ApiOperation } from '@nestjs/swagger';
import { JoinCommunityDto } from './dto/join-community-dto';
import { CreateCommunityDto } from './dto/create-community.dto';

@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Post()
  @ApiOperation({ summary: '커뮤니티 생성' })
  create(@Body() communityDto: CreateCommunityDto) {
    return this.communitiesService.create(communityDto);
  }

  @Get()
  @ApiOperation({ summary: '전체 커뮤니티 가져오기' })
  findAll() {
    return this.communitiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '커뮤니티 가져오기' })
  findOne(@Param('id') id: string) {
    return this.communitiesService.findOne(+id);
  }

  @Post('/join')
  @ApiOperation({ summary: '커뮤니티 가입' })
  join(@Body() joinDto: JoinCommunityDto) {
    return this.communitiesService.join(joinDto);
  }
}
