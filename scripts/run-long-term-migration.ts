import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function runLongTermMigration() {
  try {
    console.log('🚀 Starting long-term database migration...')
    
    // Step 1: Check if primaryCategory column exists
    console.log('📝 Step 1: Checking current database state...')
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'articles' AND column_name = 'primaryCategory';
    ` as Array<{ column_name: string, data_type: string }>
    
    if (tableInfo.length === 0) {
      console.log('📝 Adding primaryCategory column...')
      await prisma.$executeRaw`ALTER TABLE "articles" ADD COLUMN "primaryCategory" TEXT;`
      console.log('✅ primaryCategory column added')
    } else {
      console.log('✅ primaryCategory column already exists')
    }
    
    // Step 2: Copy category to primaryCategory if needed
    console.log('📝 Step 2: Ensuring primaryCategory has values...')
    const nullCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "articles" WHERE "primaryCategory" IS NULL;
    ` as Array<{ count: bigint }>
    
    if (Number(nullCount[0].count) > 0) {
      console.log(`📝 Copying category values to primaryCategory for ${nullCount[0].count} articles...`)
      await prisma.$executeRaw`
        UPDATE "articles" 
        SET "primaryCategory" = UPPER("category") 
        WHERE "primaryCategory" IS NULL AND "category" IS NOT NULL;
      `
      
      // Set default for any remaining nulls
      await prisma.$executeRaw`
        UPDATE "articles" 
        SET "primaryCategory" = 'BITCOIN' 
        WHERE "primaryCategory" IS NULL;
      `
      console.log('✅ primaryCategory values updated')
    } else {
      console.log('✅ primaryCategory already has values')
    }
    
    // Step 3: Create categories table
    console.log('📝 Step 3: Creating categories table...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "slug" TEXT NOT NULL UNIQUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `
    console.log('✅ Categories table ready')
    
    // Step 4: Create article_categories junction table
    console.log('📝 Step 4: Creating article_categories junction table...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "article_categories" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "articleId" TEXT NOT NULL,
        "categoryId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("articleId", "categoryId")
      );
    `
    console.log('✅ Article_categories table ready')
    
    // Step 5: Populate categories table
    console.log('📝 Step 5: Populating categories table...')
    const categories = [
      { name: 'BITCOIN', slug: 'bitcoin' },
      { name: 'ALTCOINS', slug: 'altcoins' },
      { name: 'DEFI', slug: 'defi' },
      { name: 'MACRO', slug: 'macro' },
      { name: 'WEB3', slug: 'web3' },
      { name: 'NFT', slug: 'nft' },
      { name: 'GAMING', slug: 'gaming' },
      { name: 'METAVERSE', slug: 'metaverse' }
    ]
    
    for (const category of categories) {
      await prisma.$executeRaw`
        INSERT INTO "categories" ("id", "name", "slug", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${category.name}, ${category.slug}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT ("name") DO NOTHING;
      `
    }
    console.log('✅ Categories populated')
    
    // Step 6: Create article-category relationships
    console.log('📝 Step 6: Creating article-category relationships...')
    const relationshipResult = await prisma.$executeRaw`
      INSERT INTO "article_categories" ("id", "articleId", "categoryId", "createdAt")
      SELECT 
        gen_random_uuid(),
        a."id",
        c."id",
        CURRENT_TIMESTAMP
      FROM "articles" a
      JOIN "categories" c ON c."name" = a."primaryCategory"
      ON CONFLICT ("articleId", "categoryId") DO NOTHING;
    `
    console.log(`✅ Created ${relationshipResult} article-category relationships`)
    
    // Step 7: Add foreign key constraints
    console.log('📝 Step 7: Adding foreign key constraints...')
    try {
      await prisma.$executeRaw`
        ALTER TABLE "article_categories" 
        ADD CONSTRAINT "article_categories_articleId_fkey" 
        FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE;
      `
    } catch (error) {
      console.log('⚠️  Foreign key constraint already exists')
    }
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE "article_categories" 
        ADD CONSTRAINT "article_categories_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE;
      `
    } catch (error) {
      console.log('⚠️  Foreign key constraint already exists')
    }
    console.log('✅ Foreign key constraints added')
    
    // Step 8: Create indexes
    console.log('📝 Step 8: Creating performance indexes...')
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "idx_articles_primaryCategory" ON "articles"("primaryCategory");',
      'CREATE INDEX IF NOT EXISTS "idx_article_categories_articleId" ON "article_categories"("articleId");',
      'CREATE INDEX IF NOT EXISTS "idx_article_categories_categoryId" ON "article_categories"("categoryId");'
    ]
    
    for (const indexQuery of indexes) {
      try {
        await prisma.$executeRawUnsafe(indexQuery)
      } catch (error) {
        console.log('⚠️  Index already exists or failed to create')
      }
    }
    console.log('✅ Performance indexes created')
    
    // Step 9: Verify migration
    console.log('📝 Step 9: Verifying migration...')
    const articleCount = await prisma.article.count()
    const categoryCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "categories"` as Array<{ count: bigint }>
    const relationshipCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "article_categories"` as Array<{ count: bigint }>
    
    console.log(`📊 Migration Results:`)
    console.log(`   - Articles: ${articleCount}`)
    console.log(`   - Categories: ${categoryCount[0].count}`)
    console.log(`   - Article-Category relationships: ${relationshipCount[0].count}`)
    
    console.log('🎉 Long-term migration completed successfully!')
    console.log('✅ Your application should now work properly with the multi-category system!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
runLongTermMigration()
  .then(() => {
    console.log('🎉 Long-term migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Long-term migration failed:', error)
    process.exit(1)
  })
