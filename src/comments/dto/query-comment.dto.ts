import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class QueryCommentDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  // 필요에 따라 정렬 기준 등을 추가할 수 있습니다.
  // @IsOptional()
  // @IsString()
  // sortBy?: string = 'createdAt';

  // @IsOptional()
  // @IsIn(['asc', 'desc'])
  // sortOrder?: 'asc' | 'desc' = 'desc';
}
