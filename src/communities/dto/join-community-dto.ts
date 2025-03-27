import { IsNotEmpty } from 'class-validator';

export class JoinCommunityDto {
  @IsNotEmpty()
  communityId: number;

  @IsNotEmpty()
  userId: number;
}
