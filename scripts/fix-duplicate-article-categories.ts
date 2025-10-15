import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixDuplicateArticleCategories() {
  try {
    console.log('🔧 Fixing duplicate article_categories...')
    
    // Find and remove duplicate article-category relationships
    const duplicates = await prisma.$queryRaw`
      SELECT "articleId", "categoryId", COUNT(*) as count
      FROM "article_categories"
      GROUP BY "articleId", "categoryId"
      HAVING COUNT(*) > 1
    `
    
    console.log(`Found ${(duplicates as any[]).length} duplicate relationships`)
    
    if ((duplicates as any[]).length > 0) {
      // Remove duplicates, keeping only the first occurrence
      await prisma.$executeRaw`
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
        )
      `
      
      console.log('✅ Removed duplicate article-category relationships')
    } else {
      console.log('✅ No duplicate relationships found')
    }
    
    // Verify the fix
    const remainingDuplicates = await prisma.$queryRaw`
      SELECT "articleId", "categoryId", COUNT(*) as count
      FROM "article_categories"
      GROUP BY "articleId", "categoryId"
      HAVING COUNT(*) > 1
    `
    
    console.log(`Remaining duplicates: ${(remainingDuplicates as any[]).length}`)
    
  } catch (error) {
    console.error('❌ Failed to fix duplicate article_categories:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixDuplicateArticleCategories()
  .then(() => {
    console.log('🎉 Duplicate article_categories fix completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fix failed:', error)
    process.exit(1)
  })
