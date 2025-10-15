import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateDatabaseSchema() {
  try {
    console.log('🚀 Starting database schema migration...')
    
    // Step 1: Add primaryCategory column to articles table
    console.log('📝 Adding primaryCategory column to articles table...')
    await prisma.$executeRaw`
      ALTER TABLE "articles" 
      ADD COLUMN IF NOT EXISTS "primaryCategory" TEXT;
    `
    
    // Step 2: Update existing articles to have primaryCategory = category
    console.log('🔄 Updating existing articles with primaryCategory...')
    await prisma.$executeRaw`
      UPDATE "articles" 
      SET "primaryCategory" = "category" 
      WHERE "primaryCategory" IS NULL;
    `
    
    // Step 3: Create categories table
    console.log('📝 Creating categories table...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "slug" TEXT NOT NULL UNIQUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `
    
    // Step 4: Create article_categories junction table
    console.log('📝 Creating article_categories junction table...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "article_categories" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "articleId" TEXT NOT NULL,
        "categoryId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("articleId", "categoryId")
      );
    `
    
    // Step 5: Add foreign key constraints
    console.log('🔗 Adding foreign key constraints...')
    await prisma.$executeRaw`
      ALTER TABLE "article_categories" 
      ADD CONSTRAINT IF NOT EXISTS "article_categories_articleId_fkey" 
      FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE;
    `
    
    await prisma.$executeRaw`
      ALTER TABLE "article_categories" 
      ADD CONSTRAINT IF NOT EXISTS "article_categories_categoryId_fkey" 
      FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE;
    `
    
    // Step 6: Create indexes for better performance
    console.log('📊 Creating indexes...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_articles_primaryCategory" ON "articles"("primaryCategory");
    `
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_article_categories_articleId" ON "article_categories"("articleId");
    `
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_article_categories_categoryId" ON "article_categories"("categoryId");
    `
    
    // Step 7: Populate categories table with existing categories
    console.log('📋 Populating categories table...')
    const existingCategories = await prisma.$queryRaw`
      SELECT DISTINCT "category" FROM "articles" WHERE "category" IS NOT NULL;
    ` as Array<{ category: string }>
    
    for (const { category } of existingCategories) {
      const slug = category.toLowerCase().replace(/\s+/g, '-')
      await prisma.$executeRaw`
        INSERT INTO "categories" ("id", "name", "slug", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${category}, ${slug}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT ("name") DO NOTHING;
      `
    }
    
    // Step 8: Create article-category relationships
    console.log('🔗 Creating article-category relationships...')
    await prisma.$executeRaw`
      INSERT INTO "article_categories" ("id", "articleId", "categoryId", "createdAt")
      SELECT 
        gen_random_uuid(),
        a."id",
        c."id",
        CURRENT_TIMESTAMP
      FROM "articles" a
      JOIN "categories" c ON c."name" = a."category"
      ON CONFLICT ("articleId", "categoryId") DO NOTHING;
    `
    
    console.log('✅ Database schema migration completed successfully!')
    
    // Verify the migration
    const articleCount = await prisma.article.count()
    const categoryCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "categories"` as Array<{ count: bigint }>
    const relationshipCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "article_categories"` as Array<{ count: bigint }>
    
    console.log(`📊 Migration Results:`)
    console.log(`   - Articles: ${articleCount}`)
    console.log(`   - Categories: ${categoryCount[0].count}`)
    console.log(`   - Article-Category relationships: ${relationshipCount[0].count}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateDatabaseSchema()
  .then(() => {
    console.log('🎉 Migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  })
