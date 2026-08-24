-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "patientNameAr" TEXT NOT NULL,
    "patientNameEn" TEXT,
    "cityAr" TEXT NOT NULL DEFAULT '',
    "cityEn" TEXT,
    "procedureAr" TEXT NOT NULL DEFAULT '',
    "procedureEn" TEXT,
    "doctorAr" TEXT NOT NULL DEFAULT '',
    "doctorEn" TEXT,
    "commentAr" TEXT NOT NULL,
    "commentEn" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "dateAr" TEXT NOT NULL DEFAULT '',
    "dateEn" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

