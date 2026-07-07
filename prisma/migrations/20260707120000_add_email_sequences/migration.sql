-- CreateEnum
CREATE TYPE "EmailSequence" AS ENUM ('WELCOME', 'LAUNCH', 'ABANDONED_CART', 'POST_PURCHASE');

-- CreateEnum
CREATE TYPE "EmailSequenceStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELED');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "unsubscribedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "EmailSequenceEnrollment" (
    "id" TEXT NOT NULL,
    "leadEmail" TEXT NOT NULL,
    "sequence" "EmailSequence" NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "status" "EmailSequenceStatus" NOT NULL DEFAULT 'ACTIVE',
    "nextSendAt" TIMESTAMP(3),
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSequenceEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailSequenceEnrollment_status_nextSendAt_idx" ON "EmailSequenceEnrollment"("status", "nextSendAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailSequenceEnrollment_leadEmail_sequence_key" ON "EmailSequenceEnrollment"("leadEmail", "sequence");

