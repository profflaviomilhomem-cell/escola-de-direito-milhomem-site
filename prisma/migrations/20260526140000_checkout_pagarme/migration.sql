-- AlterTable
ALTER TABLE "Order" ADD COLUMN "paymentPayload" JSONB;

-- CreateTable
CREATE TABLE "PagarmeWebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PagarmeWebhookEvent_pkey" PRIMARY KEY ("id")
);
