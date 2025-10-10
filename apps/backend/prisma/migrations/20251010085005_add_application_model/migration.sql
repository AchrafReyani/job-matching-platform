-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "vacancyId" INTEGER NOT NULL,
    "jobSeekerId" INTEGER NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "JobSeeker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
