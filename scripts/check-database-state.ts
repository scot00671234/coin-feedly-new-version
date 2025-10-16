import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabaseState() {
  console.log('🔍 Checking database state...')
  
  // Check categories
  const categories = await prisma.category.findMany()
  console.log(`📊 Categories in database: ${categories.length}`)
  categories.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`))
  
  // Check articles
  const totalArticles = await prisma.article.count()
  console.log(`📊 Total articles: ${totalArticles}`)
  
  // Check articles by primaryCategory
  const articlesByCategory = await prisma.article.groupBy({
    by: ['primaryCategory'],
    _count: { primaryCategory: true }
  })
  console.log('📊 Articles by primaryCategory:')
  articlesByCategory.forEach(group => {
    console.log(`  - ${group.primaryCategory}: ${group._count.primaryCategory}`)
  })
  
  // Check article-category relationships
  const articleCategories = await prisma.articleCategory.count()
  console.log(`📊 Article-category relationships: ${articleCategories}`)
  
  // Sample some articles with their categories
  const sampleArticles = await prisma.article.findMany({
    take: 3,
    include: {
      categories: {
        include: {
          category: true
        }
      }
    }
  })
  
  console.log('📝 Sample articles:')
  sampleArticles.forEach(article => {
    console.log(`  - ${article.title.substring(0, 50)}...`)
    console.log(`    Primary: ${article.primaryCategory}`)
    console.log(`    Categories: ${article.categories.map(ac => ac.category.slug).join(', ')}`)
  })
}

checkDatabaseState()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
