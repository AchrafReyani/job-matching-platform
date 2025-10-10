import { IsOptional, IsEnum, IsString } from 'class-validator';

export class UpdateApplicationDto {
  @IsOptional()
  @IsString()
  status?: 'APPLIED' | 'ACCEPTED' | 'REJECTED';
}
