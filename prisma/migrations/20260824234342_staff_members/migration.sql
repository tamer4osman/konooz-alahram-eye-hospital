-- CreateTable
CREATE TABLE "staff_members" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT,
    "roleAr" TEXT NOT NULL DEFAULT '',
    "roleEn" TEXT,
    "category" "StaffCategory" NOT NULL DEFAULT 'nurse',
    "departmentAr" TEXT NOT NULL DEFAULT '',
    "departmentEn" TEXT,
    "status" TEXT NOT NULL DEFAULT 'on_duty',
    "roomAssignedAr" TEXT NOT NULL DEFAULT '',
    "roomAssignedEn" TEXT,
    "shift" TEXT NOT NULL DEFAULT 'morning',
    "patientCountToday" INTEGER NOT NULL DEFAULT 0,
    "surgeriesCountToday" INTEGER NOT NULL DEFAULT 0,
    "phone" TEXT,
    "email" TEXT,
    "avatar" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_members_pkey" PRIMARY KEY ("id")
);

