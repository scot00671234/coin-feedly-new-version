-- CreateEnum (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE "CategoryType" AS ENUM ('BITCOIN', 'ALTCOINS', 'DEFI', 'MACRO', 'WEB3', 'NFT', 'GAMING', 'METAVERSE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable articles
ALTER TABLE "articles" ALTER COLUMN "primaryCategory" TYPE "CategoryType" USING "primaryCategory"::"CategoryType";

-- AlterTable news_sources  
ALTER TABLE "news_sources" ALTER COLUMN "primaryCategory" TYPE "CategoryType" USING "primaryCategory"::"CategoryType";
