-- DB audit fixes (2026-09-04): analytics query indexes, nullable real-patient
-- links, exact-money types, unique subscriber email.
-- Review notes:
-- * DECIMAL(12,2) casts round to 2dp — acceptable for LYD money columns.
-- * patientRefId FK is nullable with ON DELETE SET NULL: removing a portal
--   profile never destroys billing/clinical/imaging/flow records.
-- * newsletter_subscribers was verified empty before adding the unique index.

-- 1) Analytics query indexes (lib/dashboard/analytics.ts access paths)
CREATE INDEX "clinical_consultation_records_date_idx" ON "clinical_consultation_records"("date");
CREATE INDEX "diagnostic_pacs_orders_orderedAt_idx" ON "diagnostic_pacs_orders"("orderedAt");
CREATE INDEX "patient_flow_stages_enteredAt_idx" ON "patient_flow_stages"("enteredAt");
CREATE INDEX "hospital_billing_invoices_issuedDate_idx" ON "hospital_billing_invoices"("issuedDate");

-- 2) Optional real-patient links (walk-in rows keep their synthetic
--    "PT-..." patientId correlation key; patientRef attaches a portal account)
ALTER TABLE "hospital_billing_invoices" ADD COLUMN "patientRefId" TEXT;
ALTER TABLE "hospital_billing_invoices" ADD CONSTRAINT "hospital_billing_invoices_patientRefId_fkey" FOREIGN KEY ("patientRefId") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "hospital_billing_invoices_patientRefId_idx" ON "hospital_billing_invoices"("patientRefId");

ALTER TABLE "clinical_consultation_records" ADD COLUMN "patientRefId" TEXT;
ALTER TABLE "clinical_consultation_records" ADD CONSTRAINT "clinical_consultation_records_patientRefId_fkey" FOREIGN KEY ("patientRefId") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "clinical_consultation_records_patientRefId_idx" ON "clinical_consultation_records"("patientRefId");

ALTER TABLE "diagnostic_pacs_orders" ADD COLUMN "patientRefId" TEXT;
ALTER TABLE "diagnostic_pacs_orders" ADD CONSTRAINT "diagnostic_pacs_orders_patientRefId_fkey" FOREIGN KEY ("patientRefId") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "diagnostic_pacs_orders_patientRefId_idx" ON "diagnostic_pacs_orders"("patientRefId");

ALTER TABLE "patient_flow_stages" ADD COLUMN "patientRefId" TEXT;
ALTER TABLE "patient_flow_stages" ADD CONSTRAINT "patient_flow_stages_patientRefId_fkey" FOREIGN KEY ("patientRefId") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "patient_flow_stages_patientRefId_idx" ON "patient_flow_stages"("patientRefId");

-- 3) Exact-money types: double precision -> DECIMAL(12,2)
ALTER TABLE "hospital_billing_invoices" ALTER COLUMN "amount" TYPE DECIMAL(12,2);
ALTER TABLE "hospital_billing_invoices" ALTER COLUMN "surgeonFeeLYD" TYPE DECIMAL(12,2);
ALTER TABLE "hospital_billing_invoices" ALTER COLUMN "orFacilityFeeLYD" TYPE DECIMAL(12,2);
ALTER TABLE "hospital_billing_invoices" ALTER COLUMN "anesthesiaFeeLYD" TYPE DECIMAL(12,2);
ALTER TABLE "hospital_billing_invoices" ALTER COLUMN "lensOrDeviceFeeLYD" TYPE DECIMAL(12,2);
ALTER TABLE "hospital_billing_invoices" ALTER COLUMN "consumablesFeeLYD" TYPE DECIMAL(12,2);
ALTER TABLE "hospital_billing_invoices" ALTER COLUMN "totalGrossLYD" TYPE DECIMAL(12,2);
ALTER TABLE "hospital_billing_invoices" ALTER COLUMN "insuranceCoveredLYD" TYPE DECIMAL(12,2);
ALTER TABLE "hospital_billing_invoices" ALTER COLUMN "patientCoPayLYD" TYPE DECIMAL(12,2);
ALTER TABLE "consumable_types" ALTER COLUMN "unitCostLYD" TYPE DECIMAL(12,2);

-- 4) One subscription per email (table verified empty of duplicates)
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");
