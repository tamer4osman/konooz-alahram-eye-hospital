-- CreateEnum
CREATE TYPE "DoctorType" AS ENUM ('VISITING', 'LOCAL');

-- CreateEnum
CREATE TYPE "PublicAvailability" AS ENUM ('AVAILABLE_NOW', 'UPCOMING_VISIT', 'REGULAR');

-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "availability" "PublicAvailability" NOT NULL DEFAULT 'REGULAR',
ADD COLUMN     "doctorType" "DoctorType" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "experienceYears" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "highlightsAr" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "highlightsEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "originAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "originEn" TEXT,
ADD COLUMN     "photoSeed" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "specialtyId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "surgeriesCount" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "titleAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "titleEn" TEXT,
ADD COLUMN     "universityAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "universityEn" TEXT,
ADD COLUMN     "visitScheduleAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "visitScheduleEn" TEXT;
