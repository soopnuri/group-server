import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UpdatePostDto {
  @IsNotEmpty()
  @IsInt()
  postId: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
