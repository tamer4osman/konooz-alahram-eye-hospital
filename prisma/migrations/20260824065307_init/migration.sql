-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'STAFF');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('scheduled', 'confirmed', 'in_queue', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "AppointmentSource" AS ENUM ('PATIENT_REQUEST', 'STAFF_ENTRY');

-- CreateEnum
CREATE TYPE "StaffCategory" AS ENUM ('surgeon', 'consultant', 'resident', 'nurse', 'technician', 'admin');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('operating_theater', 'outpatient_clinic', 'diagnostic_suite', 'recovery_ward', 'laser_room');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('occupied_surgery', 'in_consultation', 'ready_clean', 'sterilizing', 'maintenance');

-- CreateEnum
CREATE TYPE "SurgeryStatus" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('operational', 'in_use', 'under_calibration', 'maintenance_scheduled', 'offline_alert');

-- CreateEnum
CREATE TYPE "WardType" AS ENUM ('pacu_recovery', 'daycare_suite', 'vip_inpatient');

-- CreateEnum
CREATE TYPE "BedStatus" AS ENUM ('occupied', 'ready_clean', 'dirty_cleaning', 'reserved');

-- CreateEnum
CREATE TYPE "PatientFlowStageType" AS ENUM ('reception', 'triage', 'consultation', 'procedure', 'waiting_discharge', 'discharged');

-- CreateEnum
CREATE TYPE "ConsumableCategory" AS ENUM ('iol_lens', 'viscoelastic', 'laser_pack', 'surgical_gas', 'microsuture', 'phaco_pack');

-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('morning', 'evening', 'night_call', 'full_day');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent', 'on_leave', 'late');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('pending', 'paid', 'partially_paid', 'cancelled');

-- CreateEnum
CREATE TYPE "PacsOrderStatus" AS ENUM ('ordered', 'in_progress', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PATIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullNameAr" TEXT NOT NULL,
    "fullNameEn" TEXT,
    "phone" TEXT NOT NULL,
    "whatsappNumber" TEXT,
    "dateOfBirth" TEXT,
    "gender" "Gender" NOT NULL DEFAULT 'MALE',
    "bloodGroup" TEXT,
    "cityAr" TEXT,
    "cityEn" TEXT,
    "allergiesAr" TEXT[],
    "allergiesEn" TEXT[],
    "chronicConditionsAr" TEXT[],
    "chronicConditionsEn" TEXT[],
    "refractiveData" JSONB,
    "emergencyContact" JSONB,
    "communicationPreferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT,
    "roomId" TEXT,
    "ticketNumber" TEXT NOT NULL,
    "doctorDisplayNameAr" TEXT,
    "doctorDisplayNameEn" TEXT,
    "specialtyAr" TEXT,
    "specialtyEn" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'scheduled',
    "source" "AppointmentSource" NOT NULL DEFAULT 'PATIENT_REQUEST',
    "locationAr" TEXT,
    "locationEn" TEXT,
    "instructionsAr" TEXT,
    "instructionsEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT,
    "medicationNameAr" TEXT,
    "medicationNameEn" TEXT,
    "dosageAr" TEXT,
    "dosageEn" TEXT,
    "instructionsAr" TEXT,
    "instructionsEn" TEXT,
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "notesAr" TEXT,
    "notesEn" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "fullNameAr" TEXT NOT NULL,
    "fullNameEn" TEXT,
    "specialtyAr" TEXT NOT NULL,
    "specialtyEn" TEXT,
    "category" "StaffCategory" NOT NULL DEFAULT 'consultant',
    "phone" TEXT,
    "email" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT,
    "type" "RoomType" NOT NULL,
    "status" "RoomStatus" NOT NULL DEFAULT 'ready_clean',
    "floor" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_surgeries" (
    "id" TEXT NOT NULL,
    "patientId" TEXT,
    "surgeonId" TEXT NOT NULL,
    "roomId" TEXT,
    "procedureAr" TEXT NOT NULL,
    "procedureEn" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "status" "SurgeryStatus" NOT NULL DEFAULT 'scheduled',
    "notesAr" TEXT,
    "notesEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_surgeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT,
    "modelNumber" TEXT,
    "status" "DeviceStatus" NOT NULL DEFAULT 'operational',
    "locationAr" TEXT,
    "locationEn" TEXT,
    "calibrationDue" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beds" (
    "id" TEXT NOT NULL,
    "wardType" "WardType" NOT NULL,
    "label" TEXT NOT NULL,
    "status" "BedStatus" NOT NULL DEFAULT 'ready_clean',
    "patientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_flow_stages" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "stageType" "PatientFlowStageType" NOT NULL,
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitedAt" TIMESTAMP(3),
    "notesAr" TEXT,
    "notesEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_flow_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumable_types" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT,
    "category" "ConsumableCategory" NOT NULL,
    "unitAr" TEXT NOT NULL,
    "unitEn" TEXT,
    "stockLevel" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consumable_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surgery_consumable_usage" (
    "id" TEXT NOT NULL,
    "surgeryId" TEXT NOT NULL,
    "consumableTypeId" TEXT NOT NULL,
    "quantityUsed" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surgery_consumable_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_attendance_records" (
    "id" TEXT NOT NULL,
    "staffName" TEXT NOT NULL,
    "staffId" TEXT,
    "shiftType" "ShiftType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'present',
    "checkInTime" TEXT,
    "checkOutTime" TEXT,
    "notesAr" TEXT,
    "notesEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_consultation_records" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientNameAr" TEXT NOT NULL,
    "patientNameEn" TEXT,
    "doctorNameAr" TEXT NOT NULL,
    "doctorNameEn" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "chiefComplaintAr" TEXT,
    "chiefComplaintEn" TEXT,
    "diagnosisAr" TEXT,
    "diagnosisEn" TEXT,
    "notesAr" TEXT,
    "notesEn" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_consultation_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ophthalmic_prescription_items" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "odSphere" TEXT,
    "odCyl" TEXT,
    "odAxis" TEXT,
    "osSphere" TEXT,
    "osCyl" TEXT,
    "osAxis" TEXT,
    "addition" TEXT,
    "ipd" TEXT,
    "notesAr" TEXT,
    "notesEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ophthalmic_prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_providers" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_policies" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "policyNo" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_billing_invoices" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientNameAr" TEXT,
    "patientNameEn" TEXT,
    "serviceAr" TEXT NOT NULL,
    "serviceEn" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'LYD',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'pending',
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "notesAr" TEXT,
    "notesEn" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospital_billing_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_pacs_orders" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientNameAr" TEXT NOT NULL,
    "patientNameEn" TEXT,
    "examTypeAr" TEXT NOT NULL,
    "examTypeEn" TEXT,
    "bodyPartAr" TEXT,
    "bodyPartEn" TEXT,
    "status" "PacsOrderStatus" NOT NULL DEFAULT 'ordered',
    "orderedByAr" TEXT NOT NULL,
    "orderedByEn" TEXT,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "notesAr" TEXT,
    "notesEn" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_pacs_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT,
    "nameAr" TEXT,
    "nameEn" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "consented" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "patient_profiles_userId_key" ON "patient_profiles"("userId");

-- CreateIndex
CREATE INDEX "patient_profiles_phone_idx" ON "patient_profiles"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_ticketNumber_key" ON "appointments"("ticketNumber");

-- CreateIndex
CREATE INDEX "appointments_patientId_idx" ON "appointments"("patientId");

-- CreateIndex
CREATE INDEX "appointments_doctorId_idx" ON "appointments"("doctorId");

-- CreateIndex
CREATE INDEX "appointments_date_idx" ON "appointments"("date");

-- CreateIndex
CREATE INDEX "prescriptions_patientId_idx" ON "prescriptions"("patientId");

-- CreateIndex
CREATE INDEX "scheduled_surgeries_surgeonId_idx" ON "scheduled_surgeries"("surgeonId");

-- CreateIndex
CREATE INDEX "scheduled_surgeries_scheduledAt_idx" ON "scheduled_surgeries"("scheduledAt");

-- CreateIndex
CREATE INDEX "patient_flow_stages_patientId_idx" ON "patient_flow_stages"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "surgery_consumable_usage_surgeryId_consumableTypeId_key" ON "surgery_consumable_usage"("surgeryId", "consumableTypeId");

-- CreateIndex
CREATE INDEX "staff_attendance_records_date_idx" ON "staff_attendance_records"("date");

-- CreateIndex
CREATE INDEX "clinical_consultation_records_patientId_idx" ON "clinical_consultation_records"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_policies_patientId_providerId_key" ON "insurance_policies"("patientId", "providerId");

-- CreateIndex
CREATE INDEX "hospital_billing_invoices_patientId_idx" ON "hospital_billing_invoices"("patientId");

-- CreateIndex
CREATE INDEX "diagnostic_pacs_orders_patientId_idx" ON "diagnostic_pacs_orders"("patientId");

-- CreateIndex
CREATE INDEX "consent_records_userId_idx" ON "consent_records"("userId");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_surgeries" ADD CONSTRAINT "scheduled_surgeries_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_surgeries" ADD CONSTRAINT "scheduled_surgeries_surgeonId_fkey" FOREIGN KEY ("surgeonId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_surgeries" ADD CONSTRAINT "scheduled_surgeries_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_consumable_usage" ADD CONSTRAINT "surgery_consumable_usage_surgeryId_fkey" FOREIGN KEY ("surgeryId") REFERENCES "scheduled_surgeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_consumable_usage" ADD CONSTRAINT "surgery_consumable_usage_consumableTypeId_fkey" FOREIGN KEY ("consumableTypeId") REFERENCES "consumable_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ophthalmic_prescription_items" ADD CONSTRAINT "ophthalmic_prescription_items_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "clinical_consultation_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "insurance_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
