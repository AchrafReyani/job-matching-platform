import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterJobSeekerDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  fullName!: string;

  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  @IsOptional()
  @IsString()
  experienceSummary?: string;
}
