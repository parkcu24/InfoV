-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cacheUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "cachedMatches" JSONB,
ADD COLUMN     "cachedProfile" JSONB;
