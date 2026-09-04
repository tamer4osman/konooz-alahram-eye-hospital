-- Reporting-accuracy round (2026-09-04 grilling):
-- Q2 expiryDate TEXT -> TIMESTAMP (verified: 7/8 rows clean ISO 'YYYY-MM-DD', 1 NULL)
-- Q3/Q4 appointment no_show status + cancel reason/note
-- Q5/Q7 identity-linked PatientSurvey, one per ticket (unique)
-- Report indexes: AR aging (status, issuedDate), cancellation Pareto (status, date)

-- TODO: verify rows before running; fail loudly if a value cannot cast.
DO $$
DECLARE bad_rows int;
BEGIN
  SELECT COUNT(*) INTO bad_rows
  FROM "consumable_types"
  WHERE "expiryDate" IS NOT NULL
    AND NULLIF("expiryDate", '')::timestamp IS NULL;
  IF bad_rows > 0 THEN
    RAISE EXCEPTION 'expiryDate cast check failed for % row(s)', bad_rows;
  END IF;
END $$;

ALTER TABLE "consumable_types" ALTER COLUMN "expiryDate" TYPE TIMESTAMP(3) USING NULLIF("expiryDate", '')::timestamp;

ALTER TYPE "AppointmentStatus" ADD VALUE 'no_show';

CREATE TYPE "AppointmentCancelReason" AS ENUM ('patient_request', 'clinic_decision', 'duplicate', 'rescheduled', 'other');

ALTER TABLE "appointments" ADD COLUMN "cancelReason" "AppointmentCancelReason";
ALTER TABLE "appointments" ADD COLUMN "cancelNote" TEXT;

-- CreateTable
CREATE TABLE "patient_surveys" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "patientRefId" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "recommendScore" INTEGER NOT NULL,
    "commentAr" TEXT,
    "commentEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_surveys_ticketNumber_key" ON "patient_surveys"("ticketNumber");

-- CreateIndex
CREATE INDEX "patient_surveys_patientRefId_idx" ON "patient_surveys"("patientRefId");

-- CreateIndex
CREATE INDEX "patient_surveys_createdAt_idx" ON "patient_surveys"("createdAt");

-- AddForeignKey
ALTER TABLE "patient_surveys" ADD CONSTRAINT "patient_surveys_patientRefId_fkey" FOREIGN KEY ("patientRefId") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Report indexes
CREATE INDEX "hospital_billing_invoices_status_issuedDate_idx" ON "hospital_billing_invoices"("status", "issuedDate");

CREATE INDEX "appointments_status_date_idx" ON "appointments"("status", "date");
