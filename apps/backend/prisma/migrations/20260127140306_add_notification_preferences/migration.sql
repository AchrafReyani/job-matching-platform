-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notificationPreferences" JSONB NOT NULL DEFAULT '{}';
