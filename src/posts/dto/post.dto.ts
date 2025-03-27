import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class PostDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsInt()
  authorId: number;

  @IsNotEmpty()
  @IsInt()
  communityId: number;

  createdAt: Date;
  updatedAt: Date;
}
