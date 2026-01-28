import { IsString, IsOptional } from 'class-validator';

export class CreateVacancyDto {
  @IsString()
  title!: string;

  @IsString()
  role!: string;

  @IsString()
  jobDescription!: string;

  @IsOptional()
  @IsString()
  salaryRange?: string;
}
