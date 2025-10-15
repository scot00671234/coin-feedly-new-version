-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('BITCOIN', 'ALTCOINS', 'DEFI', 'MACRO', 'WEB3', 'NFT', 'GAMING', 'METAVERSE');

-- AlterTable
ALTER TABLE "articles" ADD COLUMN "primaryCategory" "CategoryType" NOT NULL DEFAULT 'BITCOIN';

-- Update existing data
UPDATE "articles" SET "primaryCategory" = CASE 
  WHEN LOWER("category") LIKE '%bitcoin%' THEN 'BITCOIN'::"CategoryType"
  WHEN LOWER("category") LIKE '%altcoin%' OR LOWER("category") LIKE '%ethereum%' OR LOWER("category") LIKE '%crypto%' THEN 'ALTCOINS'::"CategoryType"
  WHEN LOWER("category") LIKE '%defi%' OR LOWER("category") LIKE '%decentralized%' THEN 'DEFI'::"CategoryType"
  WHEN LOWER("category") LIKE '%macro%' OR LOWER("category") LIKE '%economy%' OR LOWER("category") LIKE '%market%' THEN 'MACRO'::"CategoryType"
  WHEN LOWER("category") LIKE '%web3%' THEN 'WEB3'::"CategoryType"
  WHEN LOWER("category") LIKE '%nft%' THEN 'NFT'::"CategoryType"
  WHEN LOWER("category") LIKE '%gaming%' OR LOWER("category") LIKE '%game%' THEN 'GAMING'::"CategoryType"
  WHEN LOWER("category") LIKE '%metaverse%' THEN 'METAVERSE'::"CategoryType"
  ELSE 'BITCOIN'::"CategoryType"
END;

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_categories" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "article_categories_articleId_categoryId_key" ON "article_categories"("articleId", "categoryId");

-- CreateIndex
CREATE INDEX "idx_articles_primaryCategory" ON "articles"("primaryCategory");

-- CreateIndex
CREATE INDEX "idx_article_categories_articleId" ON "article_categories"("articleId");

-- CreateIndex
CREATE INDEX "idx_article_categories_categoryId" ON "article_categories"("categoryId");

-- AddForeignKey
ALTER TABLE "article_categories" ADD CONSTRAINT "article_categories_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_categories" ADD CONSTRAINT "article_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default categories
INSERT INTO "categories" ("id", "name", "slug", "createdAt", "updatedAt") VALUES
('cat_bitcoin', 'Bitcoin', 'bitcoin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_altcoins', 'Altcoins', 'altcoins', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_defi', 'DeFi', 'defi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_macro', 'Macro', 'macro', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_web3', 'Web3', 'web3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_nft', 'NFT', 'nft', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_gaming', 'Gaming', 'gaming', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_metaverse', 'Metaverse', 'metaverse', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create article-category relationships based on primaryCategory
INSERT INTO "article_categories" ("id", "articleId", "categoryId", "createdAt")
SELECT 
    gen_random_uuid(),
    a."id",
    c."id",
    CURRENT_TIMESTAMP
FROM "articles" a
JOIN "categories" c ON c."name" = a."primaryCategory"::text
ON CONFLICT ("articleId", "categoryId") DO NOTHING;
