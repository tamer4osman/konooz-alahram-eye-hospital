-- CreateTable
CREATE TABLE "public"."client_error_reports" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "digest" TEXT,
    "stack" TEXT,
    "locale" TEXT,
    "path" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_error_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."departments" (
    "id" TEXT NOT NULL,
    "iconName" TEXT NOT NULL DEFAULT 'Sparkles',
    "image" TEXT,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "shortDescAr" TEXT NOT NULL DEFAULT '',
    "shortDescEn" TEXT NOT NULL DEFAULT '',
    "fullDescAr" TEXT NOT NULL DEFAULT '',
    "fullDescEn" TEXT NOT NULL DEFAULT '',
    "badgeAr" TEXT NOT NULL DEFAULT '',
    "badgeEn" TEXT NOT NULL DEFAULT '',
    "proceduresAr" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "proceduresEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "technologiesAr" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "technologiesEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "durationAr" TEXT NOT NULL DEFAULT '',
    "durationEn" TEXT NOT NULL DEFAULT '',
    "recoveryAr" TEXT NOT NULL DEFAULT '',
    "recoveryEn" TEXT NOT NULL DEFAULT '',
    "suitableForAr" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suitableForEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "intakeSchema" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_error_reports_createdAt_idx" ON "public"."client_error_reports"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "client_error_reports_digest_idx" ON "public"."client_error_reports"("digest" ASC);

