import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommunityRuleDto {
  @IsInt()
  @IsNotEmpty()
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
