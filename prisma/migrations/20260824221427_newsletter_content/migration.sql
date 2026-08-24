-- CreateTable
CREATE TABLE "newsletter_topics" (
    "id" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'Sparkles',
    "frequencyAr" TEXT NOT NULL DEFAULT '',
    "frequencyEn" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_issues" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL DEFAULT '',
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT,
    "categoryAr" TEXT NOT NULL DEFAULT '',
    "categoryEn" TEXT,
    "readTimeAr" TEXT NOT NULL DEFAULT '',
    "readTimeEn" TEXT,
    "summaryAr" TEXT NOT NULL DEFAULT '',
    "summaryEn" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_issues_pkey" PRIMARY KEY ("id")
);

