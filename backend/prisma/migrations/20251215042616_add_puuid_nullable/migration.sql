/*
  Warnings:

  - You are about to drop the column `riotPuuid` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[puuid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_riotPuuid_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "riotPuuid",
ADD COLUMN     "puuid" TEXT,
ALTER COLUMN "gameName" DROP NOT NULL,
ALTER COLUMN "tagLine" DROP NOT NULL,
ALTER COLUMN "region" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_puuid_key" ON "User"("puuid");
