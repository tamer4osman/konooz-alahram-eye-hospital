-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('pending', 'paid', 'failed', 'expired', 'refunded', 'voided', 'cancelled');

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "dpaySessionId" INTEGER NOT NULL,
    "payMethod" TEXT NOT NULL,
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'LYD',
    "txId" TEXT,
    "receiptUrl" TEXT,
    "payerAccount" TEXT,
    "failureReason" TEXT,
    "confirmedBy" TEXT,
    "lastWebhookEvent" TEXT,
    "lastWebhookAt" TIMESTAMP(3),
    "lastPollAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_dpaySessionId_key" ON "payment_transactions"("dpaySessionId");

-- CreateIndex
CREATE INDEX "payment_transactions_invoiceId_idx" ON "payment_transactions"("invoiceId");

-- CreateIndex
CREATE INDEX "payment_transactions_status_idx" ON "payment_transactions"("status");

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "hospital_billing_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
