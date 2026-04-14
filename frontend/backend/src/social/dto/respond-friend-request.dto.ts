import { IsIn } from 'class-validator';

export class RespondFriendRequestDto {
  @IsIn(['accept', 'reject'])
  action!: 'accept' | 'reject';
}
