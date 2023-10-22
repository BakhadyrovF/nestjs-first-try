/*
  Warnings:

  - You are about to drop the column `invalidatedAt` on the `SessionToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SessionToken" DROP COLUMN "invalidatedAt";

-- AlterTable
ALTER TABLE "UserSession" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
