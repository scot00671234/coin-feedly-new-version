-- Fix duplicate article_categories by removing duplicates
-- This migration removes duplicate article-category relationships

-- Remove duplicates, keeping only the first occurrence
DELETE FROM "article_categories"
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY "articleId", "categoryId" 
      ORDER BY "createdAt"
    ) as rn
    FROM "article_categories"
  ) t
  WHERE rn > 1
);
