import { IsOptional, IsString } from "class-validator";

export class UpdateVacancyDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  jobDescription?: string;

  @IsOptional()
  @IsString()
  salaryRange?: string;
}
