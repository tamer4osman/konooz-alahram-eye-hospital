-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "qAr" TEXT NOT NULL,
    "qEn" TEXT,
    "aAr" TEXT NOT NULL,
    "aEn" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

