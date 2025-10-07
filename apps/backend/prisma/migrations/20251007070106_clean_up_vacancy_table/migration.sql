/*
  Warnings:

  - You are about to drop the column `userId` on the `Vacancy` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Vacancy" DROP CONSTRAINT "Vacancy_userId_fkey";

-- AlterTable
ALTER TABLE "Vacancy" DROP COLUMN "userId";
