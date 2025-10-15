import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixDatabaseStepByStep() {
  try {
    console.log('🚀 Starting step-by-step database fix...')
    
    // Step 1: Add primaryCategory column as nullable first
    console.log('📝 Step 1: Adding primaryCategory column as nullable...')
    await prisma.$executeRaw`
      ALTER TABLE "articles" 
      ADD COLUMN IF NOT EXISTS "primaryCategory" TEXT;
    `
    console.log('✅ Step 1 completed: primaryCategory column added')
    
    // Step 2: Update existing articles to copy category to primaryCategory
    console.log('📝 Step 2: Copying category values to primaryCategory...')
    const updateResult = await prisma.$executeRaw`
      UPDATE "articles" 
      SET "primaryCategory" = "category" 
      WHERE "primaryCategory" IS NULL AND "category" IS NOT NULL;
    `
    console.log(`✅ Step 2 completed: Updated ${updateResult} articles`)
    
    // Step 3: Set default value for any remaining null primaryCategory
    console.log('📝 Step 3: Setting default values for remaining null primaryCategory...')
    const defaultResult = await prisma.$executeRaw`
      UPDATE "articles" 
      SET "primaryCategory" = 'BITCOIN' 
      WHERE "primaryCategory" IS NULL;
    `
    console.log(`✅ Step 3 completed: Set default for ${defaultResult} articles`)
    
    // Step 4: Make primaryCategory NOT NULL
    console.log('📝 Step 4: Making primaryCategory NOT NULL...')
    await prisma.$executeRaw`
      ALTER TABLE "articles" 
      ALTER COLUMN "primaryCategory" SET NOT NULL;
    `
    console.log('✅ Step 4 completed: primaryCategory is now NOT NULL')
    
    // Step 5: Create categories table
    console.log('📝 Step 5: Creating categories table...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "slug" TEXT NOT NULL UNIQUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `
    console.log('✅ Step 5 completed: categories table created')
    
    // Step 6: Create article_categories junction table
    console.log('📝 Step 6: Creating article_categories junction table...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "article_categories" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "articleId" TEXT NOT NULL,
        "categoryId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("articleId", "categoryId")
      );
    `
    console.log('✅ Step 6 completed: article_categories table created')
    
    // Step 7: Add foreign key constraints
    console.log('📝 Step 7: Adding foreign key constraints...')
    try {
      await prisma.$executeRaw`
        ALTER TABLE "article_categories" 
        ADD CONSTRAINT "article_categories_articleId_fkey" 
        FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE;
      `
    } catch (error) {
      console.log('⚠️  Foreign key constraint already exists or failed to add')
    }
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE "article_categories" 
        ADD CONSTRAINT "article_categories_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE;
      `
    } catch (error) {
      console.log('⚠️  Foreign key constraint already exists or failed to add')
    }
    console.log('✅ Step 7 completed: Foreign key constraints added')
    
    // Step 8: Populate categories table
    console.log('📝 Step 8: Populating categories table...')
    const existingCategories = await prisma.$queryRaw`
      SELECT DISTINCT "primaryCategory" FROM "articles" WHERE "primaryCategory" IS NOT NULL;
    ` as Array<{ primaryCategory: string }>
    
    for (const { primaryCategory } of existingCategories) {
      const slug = primaryCategory.toLowerCase().replace(/\s+/g, '-')
      await prisma.$executeRaw`
        INSERT INTO "categories" ("id", "name", "slug", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${primaryCategory}, ${slug}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT ("name") DO NOTHING;
      `
    }
    console.log(`✅ Step 8 completed: Populated categories table with ${existingCategories.length} categories`)
    
    // Step 9: Create article-category relationships
    console.log('📝 Step 9: Creating article-category relationships...')
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
    console.log(`✅ Step 9 completed: Created ${relationshipResult} article-category relationships`)
    
    // Step 10: Create indexes for better performance
    console.log('📝 Step 10: Creating performance indexes...')
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "idx_articles_primaryCategory" ON "articles"("primaryCategory");
      `
    } catch (error) {
      console.log('⚠️  Index already exists or failed to create')
    }
    
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "idx_article_categories_articleId" ON "article_categories"("articleId");
      `
    } catch (error) {
      console.log('⚠️  Index already exists or failed to create')
    }
    
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "idx_article_categories_categoryId" ON "article_categories"("categoryId");
      `
    } catch (error) {
      console.log('⚠️  Index already exists or failed to create')
    }
    console.log('✅ Step 10 completed: Performance indexes created')
    
    console.log('🎉 Database fix completed successfully!')
    
    // Verify the migration
    const articleCount = await prisma.article.count()
    const categoryCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "categories"` as Array<{ count: bigint }>
    const relationshipCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "article_categories"` as Array<{ count: bigint }>
    
    console.log(`📊 Final Results:`)
    console.log(`   - Articles: ${articleCount}`)
    console.log(`   - Categories: ${categoryCount[0].count}`)
    console.log(`   - Article-Category relationships: ${relationshipCount[0].count}`)
    
  } catch (error) {
    console.error('❌ Database fix failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixDatabaseStepByStep()
  .then(() => {
    console.log('🎉 Database fix completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Database fix failed:', error)
    process.exit(1)
  })
