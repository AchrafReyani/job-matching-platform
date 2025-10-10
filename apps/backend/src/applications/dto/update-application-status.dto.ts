import { IsOptional, IsString } from 'class-validator';

export class UpdateApplicationDto {
  @IsOptional()
  @IsString()
  status?: 'applied' | 'accepted' | 'rejected';
}