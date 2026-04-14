import { IsIn, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class GeneratePlanDto {
  @IsString()
  @IsNotEmpty()
  goalTitle!: string;

  @IsInt()
  @Min(3)
  @Max(30)
  periodDays!: number;

  @IsInt()
  @Min(20)
  @Max(300)
  dailyMinutes!: number;

  @IsIn(['beginner', 'intermediate', 'advanced'])
  level!: 'beginner' | 'intermediate' | 'advanced';
}
