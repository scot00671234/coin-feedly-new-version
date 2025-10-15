import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function forceMigration() {
  try {
    console.log('🚀 FORCING DATABASE MIGRATION...')
    
    // Check if primaryCategory column exists in articles table
    const articlesColumnExists = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'articles' AND column_name = 'primaryCategory';
    ` as Array<{ column_name: string }>
    
    if (articlesColumnExists.length === 0) {
      console.log('📝 Adding primaryCategory column to articles table...')
      await prisma.$executeRaw`ALTER TABLE "articles" ADD COLUMN "primaryCategory" TEXT;`
      console.log('✅ primaryCategory column added to articles')
    } else {
      console.log('✅ primaryCategory column already exists in articles')
    }
    
    // Check if primaryCategory column exists in news_sources table
    const newsSourcesColumnExists = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'news_sources' AND column_name = 'primaryCategory';
    ` as Array<{ column_name: string }>
    
    if (newsSourcesColumnExists.length === 0) {
      console.log('📝 Adding primaryCategory column to news_sources table...')
      await prisma.$executeRaw`ALTER TABLE "news_sources" ADD COLUMN "primaryCategory" TEXT;`
      console.log('✅ primaryCategory column added to news_sources')
    } else {
      console.log('✅ primaryCategory column already exists in news_sources')
    }
    
    // Copy category to primaryCategory in articles
    console.log('📝 Copying category values in articles...')
    const result = await prisma.$executeRaw`UPDATE "articles" SET "primaryCategory" = UPPER("category") WHERE "primaryCategory" IS NULL AND "category" IS NOT NULL;`
    console.log(`✅ Updated ${result} articles`)
    
    // Set default for remaining nulls in articles
    const defaultResult = await prisma.$executeRaw`UPDATE "articles" SET "primaryCategory" = 'BITCOIN' WHERE "primaryCategory" IS NULL;`
    console.log(`✅ Set default for ${defaultResult} articles`)
    
    // Set default for news_sources
    const newsSourceResult = await prisma.$executeRaw`UPDATE "news_sources" SET "primaryCategory" = 'BITCOIN' WHERE "primaryCategory" IS NULL;`
    console.log(`✅ Set default for ${newsSourceResult} news sources`)
    
    // Make it NOT NULL in articles
    console.log('📝 Making primaryCategory NOT NULL in articles...')
    await prisma.$executeRaw`ALTER TABLE "articles" ALTER COLUMN "primaryCategory" SET NOT NULL;`
    console.log('✅ articles.primaryCategory is now NOT NULL')
    
    // Make it NOT NULL in news_sources
    console.log('📝 Making primaryCategory NOT NULL in news_sources...')
    await prisma.$executeRaw`ALTER TABLE "news_sources" ALTER COLUMN "primaryCategory" SET NOT NULL;`
    console.log('✅ news_sources.primaryCategory is now NOT NULL')
    
    // Verify
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "articles"` as Array<{ count: bigint }>
    const primaryCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "articles" WHERE "primaryCategory" IS NOT NULL` as Array<{ count: bigint }>
    const newsSourceCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "news_sources"` as Array<{ count: bigint }>
    const newsSourcePrimaryCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "news_sources" WHERE "primaryCategory" IS NOT NULL` as Array<{ count: bigint }>
    
    console.log(`📊 Total articles: ${count[0].count}`)
    console.log(`📊 Articles with primaryCategory: ${primaryCount[0].count}`)
    console.log(`📊 Total news sources: ${newsSourceCount[0].count}`)
    console.log(`📊 News sources with primaryCategory: ${newsSourcePrimaryCount[0].count}`)
    
    console.log('🎉 MIGRATION COMPLETED! Articles should now load.')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

forceMigration()
  .then(() => {
    console.log('✅ FORCE MIGRATION COMPLETED!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 FORCE MIGRATION FAILED:', error)
    process.exit(1)
  })
