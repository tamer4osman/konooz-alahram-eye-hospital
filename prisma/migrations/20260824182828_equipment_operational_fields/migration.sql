-- AlterTable
ALTER TABLE "equipment" ADD COLUMN     "brand" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "departmentAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "departmentEn" TEXT,
ADD COLUMN     "firmwareVersion" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "healthScore" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "lastMaintenanceDate" TEXT,
ADD COLUMN     "nextServiceDue" TEXT,
ADD COLUMN     "notesAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "notesEn" TEXT,
ADD COLUMN     "roomCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "serialNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "technicianInChargeAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "technicianInChargeEn" TEXT,
ADD COLUMN     "totalProceduresRun" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "uptimePercentage" DOUBLE PRECISION NOT NULL DEFAULT 100;

