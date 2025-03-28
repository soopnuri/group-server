import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommunityRuleDto {
  @IsInt()
  @IsOptional()
  id: number;

  @IsInt()
  @IsNotEmpty()
  communityId: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
