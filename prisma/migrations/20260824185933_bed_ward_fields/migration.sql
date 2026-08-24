-- AlterTable
ALTER TABLE "beds" DROP COLUMN "label",
ADD COLUMN     "admissionTime" TEXT,
ADD COLUMN     "assignedDoctorAr" TEXT,
ADD COLUMN     "assignedDoctorEn" TEXT,
ADD COLUMN     "bedNumber" TEXT NOT NULL,
ADD COLUMN     "bloodPressure" TEXT,
ADD COLUMN     "estimatedDischargeTime" TEXT,
ADD COLUMN     "floorAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "floorEn" TEXT,
ADD COLUMN     "heartRateBpm" INTEGER,
ADD COLUMN     "nurseInChargeAr" TEXT,
ADD COLUMN     "nurseInChargeEn" TEXT,
ADD COLUMN     "painScore" INTEGER,
ADD COLUMN     "patientAge" INTEGER,
ADD COLUMN     "patientNameAr" TEXT,
ADD COLUMN     "patientNameEn" TEXT,
ADD COLUMN     "spO2Percent" INTEGER,
ADD COLUMN     "surgeryPerformedAr" TEXT,
ADD COLUMN     "surgeryPerformedEn" TEXT,
ADD COLUMN     "tempCelsius" DOUBLE PRECISION,
ADD COLUMN     "wardNameAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "wardNameEn" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "beds_bedNumber_key" ON "beds"("bedNumber");

