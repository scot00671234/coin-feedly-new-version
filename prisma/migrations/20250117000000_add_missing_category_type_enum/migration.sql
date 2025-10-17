-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('BITCOIN', 'ALTCOINS', 'DEFI', 'MACRO', 'WEB3', 'NFT', 'GAMING', 'METAVERSE');

-- AlterTable
ALTER TABLE "articles" ALTER COLUMN "primaryCategory" TYPE "CategoryType" USING "primaryCategory"::"CategoryType";

-- AlterTable  
ALTER TABLE "news_sources" ALTER COLUMN "primaryCategory" TYPE "CategoryType" USING "primaryCategory"::"CategoryType";
