-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- CreateTable
CREATE TABLE "ArchivedUser" (
    "id" SERIAL NOT NULL,
    "originalId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "profileData" JSONB NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedBy" TEXT NOT NULL,

    CONSTRAINT "ArchivedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivedVacancy" (
    "id" SERIAL NOT NULL,
    "originalId" INTEGER NOT NULL,
    "companyName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "salaryRange" TEXT,
    "role" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "applicationCount" INTEGER NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedBy" TEXT NOT NULL,

    CONSTRAINT "ArchivedVacancy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivedApplication" (
    "id" SERIAL NOT NULL,
    "originalId" INTEGER NOT NULL,
    "vacancyTitle" TEXT NOT NULL,
    "seekerName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedBy" TEXT NOT NULL,

    CONSTRAINT "ArchivedApplication_pkey" PRIMARY KEY ("id")
);
