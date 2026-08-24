-- AlterTable
ALTER TABLE "consumable_types" ADD COLUMN     "batchLot" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "brand" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "expiryDate" TEXT,
ADD COLUMN     "locationAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "locationEn" TEXT,
ADD COLUMN     "reorderStatus" TEXT NOT NULL DEFAULT 'optimal',
ADD COLUMN     "unitCostLYD" DOUBLE PRECISION NOT NULL DEFAULT 0;

