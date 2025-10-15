-- Fix news_sources table to add primaryCategory column
-- This migration adds the missing primaryCategory column to news_sources table

-- First, add the primaryCategory column with a default value
ALTER TABLE "news_sources" ADD COLUMN "primaryCategory" "CategoryType" NOT NULL DEFAULT 'BITCOIN';

-- Update existing records to map the old category field to the new primaryCategory field
UPDATE "news_sources" SET "primaryCategory" = CASE 
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

-- Drop the old category column
ALTER TABLE "news_sources" DROP COLUMN "category";

-- Add index for better performance
CREATE INDEX "idx_news_sources_primaryCategory" ON "news_sources"("primaryCategory");
