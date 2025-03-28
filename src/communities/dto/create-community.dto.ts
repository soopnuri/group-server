import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateCommunityRuleDto } from './create-rule.dto';

export class CreateCommunityDto {
  @IsNotEmpty()
  @IsNumber()
  creatorId: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsOptional()
  @IsArray()
  rules?: CreateCommunityRuleDto[];

  // relations
  // members: string[];
  // rules: string[];
  // moderators: string[];
  // communityRoles: string[];
  // createdAt: Date;
}
