import { IsOptional, IsEnum } from 'class-validator';

export enum ApplicationStatus {
  APPLIED = 'applied',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export class UpdateApplicationDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}
