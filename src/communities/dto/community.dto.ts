import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CommunityDto {
  @IsNotEmpty()
  @IsString()
  communityId: number;

  @IsNotEmpty()
  @IsInt()
  creatorId: number;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsOptional()
  rules?: string[];

  @IsOptional()
  moderators?: number[];

  // relations
  // members: string[];
  // communityRoles: string[];

  // createdAt: Date;
}
