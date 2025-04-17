import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  comment: string;

  // 대댓글 경우 부모 댓글의 ID 를 받는다.
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  parentCommentId?: number;
}
