import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function forceMigration() {
  try {
    console.log('🚀 FORCING DATABASE MIGRATION...')
    
    // Check if primaryCategory column exists
    const columnExists = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'articles' AND column_name = 'primaryCategory';
    ` as Array<{ column_name: string }>
    
    if (columnExists.length === 0) {
      console.log('📝 Adding primaryCategory column...')
      await prisma.$executeRaw`ALTER TABLE "articles" ADD COLUMN "primaryCategory" TEXT;`
      console.log('✅ primaryCategory column added')
    } else {
      console.log('✅ primaryCategory column already exists')
    }
    
    // Copy category to primaryCategory
    console.log('📝 Copying category values...')
    const result = await prisma.$executeRaw`UPDATE "articles" SET "primaryCategory" = UPPER("category") WHERE "primaryCategory" IS NULL AND "category" IS NOT NULL;`
    console.log(`✅ Updated ${result} articles`)
    
    // Set default for remaining nulls
    const defaultResult = await prisma.$executeRaw`UPDATE "articles" SET "primaryCategory" = 'BITCOIN' WHERE "primaryCategory" IS NULL;`
    console.log(`✅ Set default for ${defaultResult} articles`)
    
    // Make it NOT NULL
    console.log('📝 Making primaryCategory NOT NULL...')
    await prisma.$executeRaw`ALTER TABLE "articles" ALTER COLUMN "primaryCategory" SET NOT NULL;`
    console.log('✅ primaryCategory is now NOT NULL')
    
    // Verify
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "articles"` as Array<{ count: bigint }>
    const primaryCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "articles" WHERE "primaryCategory" IS NOT NULL` as Array<{ count: bigint }>
    
    console.log(`📊 Total articles: ${count[0].count}`)
    console.log(`📊 Articles with primaryCategory: ${primaryCount[0].count}`)
    
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
