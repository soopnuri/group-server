import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateVoteDto {
  @IsNotEmpty()
  @IsInt()
  vote: 1 | -1;

  @IsNotEmpty()
  @IsInt()
  userId: number;

  // @IsNotEmpty()
  // @IsInt()
  // postId: number;
}
