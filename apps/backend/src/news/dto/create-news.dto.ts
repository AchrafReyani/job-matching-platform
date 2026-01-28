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

export class CreateNewsDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsEnum(NewsCategory)
  category: NewsCategory;

  @IsEnum(NewsAudience)
  @IsOptional()
  audience?: NewsAudience = NewsAudience.ALL;

  @IsEnum(NewsStatus)
  @IsOptional()
  status?: NewsStatus = NewsStatus.DRAFT;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean = false;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}
