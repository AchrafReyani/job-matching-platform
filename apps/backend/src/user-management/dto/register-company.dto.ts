import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterCompanyDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  companyName!: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
