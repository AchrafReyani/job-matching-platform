import { IsEnum, IsOptional, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { NewsCategory, NewsStatus, NewsAudience } from "@prisma/client";

export class NewsQueryDto {
  @IsEnum(NewsCategory)
  @IsOptional()
  category?: NewsCategory;

  @IsEnum(NewsStatus)
  @IsOptional()
  status?: NewsStatus;

  @IsEnum(NewsAudience)
  @IsOptional()
  audience?: NewsAudience;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 10;
}
