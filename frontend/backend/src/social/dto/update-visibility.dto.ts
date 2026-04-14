import { IsIn } from 'class-validator';

export class UpdateVisibilityDto {
  @IsIn(['public', 'friends', 'private'])
  visibility!: 'public' | 'friends' | 'private';
}
