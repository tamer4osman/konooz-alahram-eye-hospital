-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PatientFlowStageType" ADD VALUE 'diagnostics';
ALTER TYPE "PatientFlowStageType" ADD VALUE 'pre_op';
ALTER TYPE "PatientFlowStageType" ADD VALUE 'in_or';
ALTER TYPE "PatientFlowStageType" ADD VALUE 'pacu';

