import { IsInt, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsInt()
  vacancyId: number;

  @IsInt()
  jobSeekerId: number;

  // Hardcoded enum values for now
  @IsString()
  status: 'APPLIED' | 'ACCEPTED' | 'REJECTED';

  @IsString()
  appliedAt: string; // ISO date string
}