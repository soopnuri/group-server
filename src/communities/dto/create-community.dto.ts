import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

  // relations
  // members: string[];
  // rules: string[];
  // moderators: string[];
  // communityRoles: string[];
  // createdAt: Date;
}
