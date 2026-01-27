-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'MATCH_ENDED';

-- CreateTable
CREATE TABLE "ArchivedMatch" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "vacancyId" INTEGER NOT NULL,
    "vacancyTitle" TEXT NOT NULL,
    "jobSeekerId" INTEGER NOT NULL,
    "jobSeekerName" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "companyName" TEXT NOT NULL,
    "applicationStatus" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL,
    "messages" JSONB NOT NULL,
    "messageCount" INTEGER NOT NULL,
    "deletedBy" TEXT NOT NULL,
    "deletedByRole" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchivedMatch_pkey" PRIMARY KEY ("id")
);
