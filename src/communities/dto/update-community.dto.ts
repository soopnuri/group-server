import { IsArray, IsOptional, IsString } from 'class-validator';
import { CreateCommunityRuleDto } from './create-rule.dto';

export class UpdateCommunityDto {
  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  rules: CreateCommunityRuleDto[];
}
