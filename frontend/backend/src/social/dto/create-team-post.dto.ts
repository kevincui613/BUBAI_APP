import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateTeamPostDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  goal!: string;

  @IsInt()
  @Min(2)
  @Max(20)
  headcount!: number;

  @IsString()
  @IsNotEmpty()
  contact!: string;
}
