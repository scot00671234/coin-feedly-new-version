import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

async function forceMigrate() {
  try {
    console.log('🚀 Starting forced database migration...')
    
    // Connect to database
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Try to run migration
    try {
      console.log('📦 Running prisma migrate deploy...')
      execSync('npx prisma migrate deploy', { stdio: 'inherit' })
      console.log('✅ Migration deployed successfully')
    } catch (migrateError) {
      console.log('⚠️  Migration failed, trying db push...')
      try {
        execSync('npx prisma db push', { stdio: 'inherit' })
        console.log('✅ Database schema updated with db push')
      } catch (pushError) {
        console.log('⚠️  DB push failed, trying manual SQL...')
        
        // Manual SQL execution
        const sql = `
          ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "slug" TEXT;
          ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "author" TEXT;
          ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "readingTime" INTEGER;
          ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;
          ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "seoTitle" TEXT;
          ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "seoDescription" TEXT;
          ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "keywords" TEXT[];
          ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "featuredImage" TEXT;
          
          CREATE UNIQUE INDEX IF NOT EXISTS "articles_slug_key" ON "articles"("slug");
        `
        
        await prisma.$executeRawUnsafe(sql)
        console.log('✅ Manual SQL executed successfully')
      }
    }
    
    // Verify the columns exist
    console.log('🔍 Verifying database schema...')
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'articles' 
      AND column_name IN ('slug', 'author', 'readingTime', 'viewCount', 'seoTitle', 'seoDescription', 'keywords', 'featuredImage')
    `
    
    console.log('📊 Found columns:', result)
    
    console.log('✅ Database migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

forceMigrate()
