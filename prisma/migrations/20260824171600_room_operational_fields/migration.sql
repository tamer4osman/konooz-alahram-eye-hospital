-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "floor",
ADD COLUMN     "airPressureHepa" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "currentDoctorAr" TEXT,
ADD COLUMN     "currentDoctorEn" TEXT,
ADD COLUMN     "currentPatientId" TEXT,
ADD COLUMN     "currentProcedureAr" TEXT,
ADD COLUMN     "currentProcedureEn" TEXT,
ADD COLUMN     "floorAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "floorEn" TEXT,
ADD COLUMN     "humidityPercent" DOUBLE PRECISION,
ADD COLUMN     "mainDeviceAssignedAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "mainDeviceAssignedEn" TEXT,
ADD COLUMN     "occupiedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sterilizationStatus" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "tempCelsius" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "rooms_code_key" ON "rooms"("code");

