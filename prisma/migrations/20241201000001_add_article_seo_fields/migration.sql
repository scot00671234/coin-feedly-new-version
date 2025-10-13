-- AlterTable
ALTER TABLE "articles" ADD COLUMN "slug" TEXT;
ALTER TABLE "articles" ADD COLUMN "author" TEXT;
ALTER TABLE "articles" ADD COLUMN "readingTime" INTEGER;
ALTER TABLE "articles" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "articles" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "articles" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "articles" ADD COLUMN "keywords" TEXT[];
ALTER TABLE "articles" ADD COLUMN "featuredImage" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");
