import { IsInt, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsInt()
  vacancyId: number;

  @IsInt()
  jobSeekerId: number;

  // Hardcoded enum values for now
  @IsString()
  status: 'applied' | 'accepted' | 'rejected';

  @IsString()
  appliedAt: string; // ISO date string
}