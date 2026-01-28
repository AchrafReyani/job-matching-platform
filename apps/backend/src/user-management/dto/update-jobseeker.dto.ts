import { IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateJobSeekerDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsUrl({}, { message: "Portfolio must be a valid URL" })
  portfolioUrl?: string;

  @IsOptional()
  @IsString()
  experienceSummary?: string;
}
