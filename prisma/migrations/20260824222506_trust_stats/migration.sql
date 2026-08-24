-- CreateTable
CREATE TABLE "trust_stats" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "labelAr" TEXT NOT NULL,
    "labelEn" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'CheckCircle2',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trust_stats_pkey" PRIMARY KEY ("id")
);

