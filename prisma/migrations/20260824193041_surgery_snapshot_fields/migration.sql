-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SurgeryStatus" ADD VALUE 'pre_op_prep';
ALTER TYPE "SurgeryStatus" ADD VALUE 'in_or';
ALTER TYPE "SurgeryStatus" ADD VALUE 'post_op_recovery';

-- DropForeignKey
ALTER TABLE "scheduled_surgeries" DROP CONSTRAINT "scheduled_surgeries_surgeonId_fkey";

-- AlterTable
ALTER TABLE "scheduled_surgeries" ADD COLUMN     "anesthesiaTypeAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "anesthesiaTypeEn" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "patientAge" INTEGER,
ADD COLUMN     "patientNameAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "patientNameEn" TEXT,
ADD COLUMN     "patientPhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'elective',
ADD COLUMN     "roomCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "specialtyId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "surgeonNameAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "surgeonNameEn" TEXT,
ADD COLUMN     "time" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "surgeonId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "scheduled_surgeries" ADD CONSTRAINT "scheduled_surgeries_surgeonId_fkey" FOREIGN KEY ("surgeonId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

