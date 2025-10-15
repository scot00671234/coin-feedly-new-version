-- Step 1: Add primaryCategory column as nullable first
ALTER TABLE "articles" 
ADD COLUMN IF NOT EXISTS "primaryCategory" TEXT;

-- Step 2: Update existing articles to copy category to primaryCategory
UPDATE "articles" 
SET "primaryCategory" = "category" 
WHERE "primaryCategory" IS NULL AND "category" IS NOT NULL;

-- Step 3: Set default value for any remaining null primaryCategory
UPDATE "articles" 
SET "primaryCategory" = 'BITCOIN' 
WHERE "primaryCategory" IS NULL;

-- Step 4: Make primaryCategory NOT NULL
ALTER TABLE "articles" 
ALTER COLUMN "primaryCategory" SET NOT NULL;

-- Step 5: Create categories table
CREATE TABLE IF NOT EXISTS "categories" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Step 6: Create article_categories junction table
CREATE TABLE IF NOT EXISTS "article_categories" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "articleId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("articleId", "categoryId")
);

-- Step 7: Add foreign key constraints
ALTER TABLE "article_categories" 
ADD CONSTRAINT IF NOT EXISTS "article_categories_articleId_fkey" 
FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE;

ALTER TABLE "article_categories" 
ADD CONSTRAINT IF NOT EXISTS "article_categories_categoryId_fkey" 
FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE;

-- Step 8: Populate categories table
INSERT INTO "categories" ("id", "name", "slug", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  "primaryCategory",
  LOWER(REPLACE("primaryCategory", ' ', '-')),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT "primaryCategory" 
  FROM "articles" 
  WHERE "primaryCategory" IS NOT NULL
) AS unique_categories
ON CONFLICT ("name") DO NOTHING;

-- Step 9: Create article-category relationships
INSERT INTO "article_categories" ("id", "articleId", "categoryId", "createdAt")
SELECT 
  gen_random_uuid(),
  a."id",
  c."id",
  CURRENT_TIMESTAMP
FROM "articles" a
JOIN "categories" c ON c."name" = a."primaryCategory"
ON CONFLICT ("articleId", "categoryId") DO NOTHING;

-- Step 10: Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_articles_primaryCategory" ON "articles"("primaryCategory");
CREATE INDEX IF NOT EXISTS "idx_article_categories_articleId" ON "article_categories"("articleId");
CREATE INDEX IF NOT EXISTS "idx_article_categories_categoryId" ON "article_categories"("categoryId");
