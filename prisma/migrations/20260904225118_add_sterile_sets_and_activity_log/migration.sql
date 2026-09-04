-- CreateEnum
CREATE TYPE "SterileSetStatus" AS ENUM ('ready', 'in_use', 'sterilizing', 'dirty');

-- CreateEnum
CREATE TYPE "OpsActivityLevel" AS ENUM ('info', 'success', 'warning');

-- DropIndex
DROP INDEX "clinical_consultation_records_patientRefId_idx";

-- DropIndex
DROP INDEX "diagnostic_pacs_orders_orderedAt_idx";

-- DropIndex
DROP INDEX "diagnostic_pacs_orders_patientRefId_idx";

-- DropIndex
DROP INDEX "hospital_billing_invoices_patientRefId_idx";

-- DropIndex
DROP INDEX "patient_flow_stages_patientRefId_idx";

-- DropIndex
DROP INDEX "patient_surveys_patientRefId_idx";

-- CreateTable
CREATE TABLE "sterile_sets" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT,
    "status" "SterileSetStatus" NOT NULL DEFAULT 'ready',
    "sterilizedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "notesAr" TEXT,
    "notesEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sterile_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops_activity_logs" (
    "id" TEXT NOT NULL,
    "messageAr" TEXT NOT NULL,
    "messageEn" TEXT,
    "level" "OpsActivityLevel" NOT NULL DEFAULT 'info',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ops_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sterile_sets_status_idx" ON "sterile_sets"("status");

-- CreateIndex
CREATE INDEX "ops_activity_logs_createdAt_idx" ON "ops_activity_logs"("createdAt");
