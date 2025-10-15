import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateToMultiCategory() {
  try {
    console.log('🔄 Starting migration to multi-category system...')
    
    // First, create categories
    const categories = [
      { name: 'Bitcoin', slug: 'bitcoin' },
      { name: 'Altcoins', slug: 'altcoins' },
      { name: 'DeFi', slug: 'defi' },
      { name: 'Macro', slug: 'macro' },
      { name: 'NFT', slug: 'nft' },
      { name: 'Web3', slug: 'web3' },
      { name: 'Regulation', slug: 'regulation' },
      { name: 'Technology', slug: 'technology' }
    ]
    
    console.log('📝 Creating categories...')
    for (const categoryData of categories) {
      await prisma.category.upsert({
        where: { slug: categoryData.slug },
        update: categoryData,
        create: categoryData
      })
      console.log(`✅ Created/updated category: ${categoryData.name}`)
    }
    
    // Get all existing articles
    console.log('📊 Fetching existing articles...')
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        primaryCategory: true
      }
    })
    
    console.log(`Found ${articles.length} articles to migrate`)
    
    // Migrate each article
    let migratedCount = 0
    for (const article of articles) {
      try {
        // Find the corresponding category
        const category = await prisma.category.findFirst({
          where: { 
            OR: [
              { name: article.primaryCategory?.toUpperCase() },
              { slug: article.primaryCategory?.toLowerCase() }
            ]
          }
        })
        
        if (category) {
          // Create article-category relationship
          await prisma.articleCategory.upsert({
            where: {
              articleId_categoryId: {
                articleId: article.id,
                categoryId: category.id
              }
            },
            update: {},
            create: {
              articleId: article.id,
              categoryId: category.id
            }
          })
          
          // Update article with primary category
          await prisma.article.update({
            where: { id: article.id },
            data: { primaryCategory: article.category }
          })
          
          migratedCount++
          console.log(`✅ Migrated article ${article.id} to category ${category.name}`)
        } else {
          console.log(`⚠️  No category found for: ${article.category}`)
        }
      } catch (error) {
        console.error(`❌ Error migrating article ${article.id}:`, error)
      }
    }
    
    console.log(`🎉 Migration completed! Migrated ${migratedCount} articles`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateToMultiCategory()
