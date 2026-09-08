-- CreateTable
CREATE TABLE "staff_audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "targetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_audit_logs_createdAt_idx" ON "staff_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "staff_audit_logs_actorId_idx" ON "staff_audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "staff_audit_logs_module_createdAt_idx" ON "staff_audit_logs"("module", "createdAt");

-- AddForeignKey
ALTER TABLE "patient_sessions" ADD CONSTRAINT "patient_sessions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "patient_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
