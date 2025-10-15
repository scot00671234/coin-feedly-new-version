import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function runMigrationNow() {
  try {
    console.log('🚀 Running database migration NOW...')
    
    // Step 1: Add primaryCategory column if it doesn't exist
    console.log('📝 Adding primaryCategory column...')
    try {
      await prisma.$executeRaw`ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "primaryCategory" TEXT;`
      console.log('✅ primaryCategory column added')
    } catch (error) {
      console.log('⚠️  Column might already exist, continuing...')
    }
    
    // Step 2: Copy category to primaryCategory
    console.log('📝 Copying category values to primaryCategory...')
    const result = await prisma.$executeRaw`UPDATE "articles" SET "primaryCategory" = UPPER("category") WHERE "primaryCategory" IS NULL AND "category" IS NOT NULL;`
    console.log(`✅ Updated ${result} articles`)
    
    // Step 3: Set default for any remaining nulls
    console.log('📝 Setting default values...')
    const defaultResult = await prisma.$executeRaw`UPDATE "articles" SET "primaryCategory" = 'BITCOIN' WHERE "primaryCategory" IS NULL;`
    console.log(`✅ Set default for ${defaultResult} articles`)
    
    // Step 4: Make it NOT NULL
    console.log('📝 Making primaryCategory NOT NULL...')
    await prisma.$executeRaw`ALTER TABLE "articles" ALTER COLUMN "primaryCategory" SET NOT NULL;`
    console.log('✅ primaryCategory is now NOT NULL')
    
    // Verify
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "articles" WHERE "primaryCategory" IS NOT NULL` as Array<{ count: bigint }>
    console.log(`📊 Articles with primaryCategory: ${count[0].count}`)
    
    console.log('🎉 Migration completed! Articles should now load.')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

runMigrationNow()
  .then(() => {
    console.log('✅ Migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  })
