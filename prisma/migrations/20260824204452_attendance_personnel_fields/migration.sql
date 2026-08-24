-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AttendanceStatus" ADD VALUE 'present_ontime';
ALTER TYPE "AttendanceStatus" ADD VALUE 'in_surgery';
ALTER TYPE "AttendanceStatus" ADD VALUE 'on_call';

-- AlterTable
ALTER TABLE "staff_attendance_records" DROP COLUMN "staffName",
ADD COLUMN     "avatar" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "badgeCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "category" "StaffCategory" NOT NULL DEFAULT 'consultant',
ADD COLUMN     "departmentAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "departmentEn" TEXT,
ADD COLUMN     "monthlyAttendanceRate" DOUBLE PRECISION NOT NULL DEFAULT 100,
ADD COLUMN     "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "punctualityMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "roleAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "roleEn" TEXT,
ADD COLUMN     "scheduledTime" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shiftNameAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shiftNameEn" TEXT,
ADD COLUMN     "shiftTiming" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "staffNameAr" TEXT NOT NULL,
ADD COLUMN     "staffNameEn" TEXT;

