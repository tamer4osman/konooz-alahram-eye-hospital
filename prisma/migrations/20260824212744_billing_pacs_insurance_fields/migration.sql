-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InvoiceStatus" ADD VALUE 'pending_insurance';
ALTER TYPE "InvoiceStatus" ADD VALUE 'pre_auth_approved';
ALTER TYPE "InvoiceStatus" ADD VALUE 'draft';

-- AlterTable
ALTER TABLE "diagnostic_pacs_orders" ADD COLUMN     "deviceUsed" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "findingsSummaryAr" TEXT,
ADD COLUMN     "findingsSummaryEn" TEXT,
ADD COLUMN     "imageThumbnail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "orderNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "technicianAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "technicianEn" TEXT,
ADD COLUMN     "ticketNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "timeCompleted" TEXT;

-- AlterTable
ALTER TABLE "hospital_billing_invoices" ADD COLUMN     "anesthesiaFeeLYD" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "consumablesFeeLYD" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "insuranceCoveredLYD" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "insuranceNameAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "insuranceNameEn" TEXT,
ADD COLUMN     "invoiceNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lensOrDeviceFeeLYD" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "orFacilityFeeLYD" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "patientCoPayLYD" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "surgeonFeeLYD" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ticketNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "totalGrossLYD" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "insurance_providers" ADD COLUMN     "contactDesk" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "coveragePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "logo" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "preAuthRequired" BOOLEAN NOT NULL DEFAULT false;

