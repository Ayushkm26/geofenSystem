/*
  Warnings:

  - You are about to drop the column `action` on the `Resync` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Resync" DROP COLUMN "action",
ADD COLUMN     "type" TEXT DEFAULT 'NETWORK-ERROR';
