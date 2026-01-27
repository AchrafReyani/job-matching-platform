import { IsBoolean, IsOptional } from 'class-validator';

// Job Seeker notification preferences
export class JobSeekerNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  applicationAccepted?: boolean;

  @IsOptional()
  @IsBoolean()
  applicationRejected?: boolean;

  @IsOptional()
  @IsBoolean()
  newMessages?: boolean;
}

// Company notification preferences
export class CompanyNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  newApplications?: boolean;

  @IsOptional()
  @IsBoolean()
  newMessages?: boolean;

  @IsOptional()
  @IsBoolean()
  applicationWithdrawn?: boolean;
}

// Union type for API response
export interface NotificationPreferences {
  // Job Seeker
  applicationAccepted?: boolean;
  applicationRejected?: boolean;
  // Company
  newApplications?: boolean;
  applicationWithdrawn?: boolean;
  // Common
  newMessages?: boolean;
}
