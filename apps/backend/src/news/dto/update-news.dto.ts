import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { NewsCategory, NewsStatus, NewsAudience } from '@prisma/client';

export class UpdateNewsDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  content?: string;

  @IsEnum(NewsCategory)
  @IsOptional()
  category?: NewsCategory;

  @IsEnum(NewsAudience)
  @IsOptional()
  audience?: NewsAudience;

  @IsEnum(NewsStatus)
  @IsOptional()
  status?: NewsStatus;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}
