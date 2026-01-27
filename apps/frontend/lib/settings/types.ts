export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationPreferences {
  // Job Seeker preferences
  applicationAccepted?: boolean;
  applicationRejected?: boolean;
  // Company preferences
  newApplications?: boolean;
  applicationWithdrawn?: boolean;
  // Common
  newMessages?: boolean;
}

export interface DeleteAccountData {
  password: string;
  confirmation: string;
}
