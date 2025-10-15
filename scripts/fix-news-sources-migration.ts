import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function fixNewsSourcesMigration() {
  try {
    console.log('🔧 Starting news_sources primaryCategory migration...')
    
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'fix-news-sources-primary-category.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Executing ${statements.length} SQL statements...`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`  ${i + 1}. Executing: ${statement.substring(0, 50)}...`)
        await prisma.$executeRawUnsafe(statement)
      }
    }
    
    console.log('✅ Successfully migrated news_sources table!')
    
    // Verify the migration worked
    const sources = await prisma.newsSource.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        primaryCategory: true
      }
    })
    
    console.log('📊 Sample news sources after migration:')
    sources.forEach(source => {
      console.log(`  - ${source.name}: ${source.primaryCategory}`)
    })
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
fixNewsSourcesMigration()
  .then(() => {
    console.log('🎉 Migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  })
