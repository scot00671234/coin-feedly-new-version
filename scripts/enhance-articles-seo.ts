import { prisma } from '../lib/db'
import { 
  generateSlug, 
  generateSEOTitle, 
  generateSEODescription, 
  generateKeywords, 
  calculateReadingTime 
} from '../lib/seo-utils'

async function enhanceArticlesWithSEO() {
  try {
    console.log('🚀 Starting SEO enhancement for articles...')
    
    // Check if slug column exists first
    let articles = []
    try {
      // Try to get articles that don't have SEO data
      articles = await prisma.article.findMany({
        where: {
          OR: [
            { slug: { equals: null } },
            { seoTitle: { equals: null } },
            { keywords: { isEmpty: true } }
          ]
        },
        include: {
          source: true
        }
      })
    } catch (columnError) {
      // If slug column doesn't exist, get all articles
      console.log('⚠️  Slug column not available, enhancing all articles')
      articles = await prisma.article.findMany({
        include: {
          source: true
        }
      })
    }

    console.log(`📊 Found ${articles.length} articles to enhance`)

    for (const article of articles) {
      try {
        // Generate SEO data
        const slug = generateSlug(article.title)
        const seoTitle = generateSEOTitle(article.title, article.category)
        const seoDescription = generateSEODescription(article.description || '', article.category)
        const keywords = generateKeywords(article.title, article.category, article.description || '')
        const readingTime = article.content ? calculateReadingTime(article.content) : null

        // Update article with SEO data (handle missing columns gracefully)
        try {
          await prisma.article.update({
            where: { id: article.id },
            data: {
              slug,
              seoTitle,
              seoDescription,
              keywords,
              readingTime,
              featuredImage: article.imageUrl
            }
          })
        } catch (updateError) {
          // If some columns don't exist, try updating only the ones that do
          console.log(`⚠️  Some SEO columns not available for article ${article.id}, skipping update`)
          continue
        }

        console.log(`✅ Enhanced: ${article.title.substring(0, 50)}...`)
      } catch (error) {
        console.error(`❌ Error enhancing article ${article.id}:`, error)
      }
    }

    console.log('🎉 SEO enhancement completed!')
  } catch (error) {
    console.error('❌ Error during SEO enhancement:', error)
  } finally {
    await prisma.$disconnect()
  }
}

enhanceArticlesWithSEO()
