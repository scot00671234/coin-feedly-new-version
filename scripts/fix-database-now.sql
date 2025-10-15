-- Quick database fix to add primaryCategory column
-- Run this directly in your PostgreSQL database

-- Step 1: Add primaryCategory column
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "primaryCategory" TEXT;

-- Step 2: Copy category values to primaryCategory
UPDATE "articles" 
SET "primaryCategory" = UPPER("category") 
WHERE "primaryCategory" IS NULL AND "category" IS NOT NULL;

-- Step 3: Set default for any remaining nulls
UPDATE "articles" 
SET "primaryCategory" = 'BITCOIN' 
WHERE "primaryCategory" IS NULL;

-- Step 4: Make it NOT NULL
ALTER TABLE "articles" ALTER COLUMN "primaryCategory" SET NOT NULL;

-- Verify the fix
SELECT COUNT(*) as total_articles, 
       COUNT(CASE WHEN "primaryCategory" IS NOT NULL THEN 1 END) as articles_with_primary_category
FROM "articles";
