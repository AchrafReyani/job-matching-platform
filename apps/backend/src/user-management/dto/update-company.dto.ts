import { IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsUrl({}, { message: "Website must be a valid URL" })
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
