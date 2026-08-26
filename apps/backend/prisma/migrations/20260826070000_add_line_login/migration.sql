-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lineSub" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_lineSub_key" ON "User"("lineSub");

