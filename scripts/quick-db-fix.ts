import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function quickDatabaseFix() {
  try {
    console.log('🚀 Quick database fix - adding primaryCategory column...')
    
    // Add primaryCategory column if it doesn't exist
    await prisma.$executeRaw`
      ALTER TABLE "articles" 
      ADD COLUMN IF NOT EXISTS "primaryCategory" TEXT;
    `
    
    // Update existing articles to copy category to primaryCategory
    await prisma.$executeRaw`
      UPDATE "articles" 
      SET "primaryCategory" = "category" 
      WHERE "primaryCategory" IS NULL AND "category" IS NOT NULL;
    `
    
    // Set default value for any remaining null primaryCategory
    await prisma.$executeRaw`
      UPDATE "articles" 
      SET "primaryCategory" = 'BITCOIN' 
      WHERE "primaryCategory" IS NULL;
    `
    
    console.log('✅ Quick database fix completed!')
    
    // Verify
    const articlesWithPrimaryCategory = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "articles" WHERE "primaryCategory" IS NOT NULL;
    ` as Array<{ count: bigint }>
    
    console.log(`📊 Articles with primaryCategory: ${articlesWithPrimaryCategory[0].count}`)
    
  } catch (error) {
    console.error('❌ Quick fix failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

quickDatabaseFix()
  .then(() => {
    console.log('🎉 Quick fix completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Quick fix failed:', error)
    process.exit(1)
  })
