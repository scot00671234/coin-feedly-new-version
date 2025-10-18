import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseRSSFeed, extractImageUrl, extractImages } from '@/lib/rss-parser'
import { detectArticleCategories } from '@/lib/category-detector'
import { getRandomCryptoImage } from '@/lib/crypto-images'

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100)
}

export const dynamic = 'force-dynamic'

const RSS_FEEDS = [
  { url: "https://cointelegraph.com/rss", categories: ["bitcoin", "altcoins", "defi", "macro"], source: "CoinTelegraph" },
  { url: "https://bitcoinist.com/feed/", categories: ["bitcoin"], source: "Bitcoinist" },
  { url: "https://decrypt.co/feed", categories: ["altcoins", "defi"], source: "Decrypt" },
  { url: "https://www.blockworks.co/feed", categories: ["defi", "macro"], source: "Blockworks" },
  { url: "https://feeds.feedburner.com/CoinDesk", categories: ["bitcoin", "macro", "regulation"], source: "CoinDesk" },
]

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Manual article fetch triggered')
    
    const articles = []
    const processedUrls = new Set<string>()

    // Process feeds in parallel for better performance
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        console.log(`📡 Fetching from ${feed.source}...`)
        const rssFeed = await parseRSSFeed(feed.url)
        
        if (!rssFeed.items || !Array.isArray(rssFeed.items)) {
          console.warn(`No items found in feed ${feed.source}`)
          return []
        }
        
        const feedArticles = []
        for (const item of rssFeed.items.slice(0, 10)) {
          try {
            if (!item.title && !item.description) {
              continue
            }
            
            if (processedUrls.has(item.link || '')) {
              continue
            }
            
            const imageUrl = extractImageUrl(item)
            const images = extractImages(item)
            
            // Check if article already exists by URL
            const existingArticle = await prisma.article.findFirst({
              where: { url: item.link || '' }
            })
            
            if (existingArticle) {
              console.log(`Article already exists: ${item.title}`)
              processedUrls.add(item.link || '')
              continue
            }
            
            // Create or find source
            let source = await prisma.newsSource.findFirst({
              where: { name: feed.source }
            })
            
            if (!source) {
              source = await prisma.newsSource.create({
                data: {
                  name: feed.source,
                  url: feed.url,
                  primaryCategory: feed.categories[0].toUpperCase(),
                  isActive: true
                }
              })
            }
            
            // Generate slug for the article
            let articleSlug = generateSlug(item.title || 'untitled')
            
            // Check if slug already exists and make it unique
            let counter = 1
            let uniqueSlug = articleSlug
            while (await prisma.article.findFirst({ where: { slug: uniqueSlug } })) {
              uniqueSlug = `${articleSlug}-${counter}`
              counter++
            }
            
            // Detect categories based on article content
            const detectedCategories = detectArticleCategories(
              item.title || '',
              item.description || '',
              item.content
            )
            
            console.log(`🎯 Detected categories for "${item.title}":`, {
              primary: detectedCategories.primary,
              secondary: detectedCategories.secondary,
              confidence: detectedCategories.confidence
            })
            
            // Create article in database
            const article = await prisma.article.create({
              data: {
                title: item.title || 'Untitled',
                description: item.description?.replace(/<[^>]*>/g, '').substring(0, 500) || '',
                content: item.content || item.description || '',
                url: item.link || '',
                slug: uniqueSlug,
                publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                imageUrl: imageUrl || getRandomCryptoImage(detectedCategories.primary, item.title),
                primaryCategory: detectedCategories.primary.toUpperCase(),
                sourceId: source.id
              },
              include: {
                source: true
              }
            })
            
            // Add detected categories to the article
            const allCategories = [detectedCategories.primary, ...detectedCategories.secondary]
            await updateArticleCategories(article.id, allCategories)
            
            feedArticles.push(article)
            processedUrls.add(item.link || '')
            console.log(`✅ Stored article: ${article.title} with detected categories: ${allCategories.join(', ')} (confidence: ${detectedCategories.confidence})`)
          } catch (itemError) {
            console.error(`Error processing article from ${feed.source}:`, itemError)
          }
        }
        
        return feedArticles
      } catch (feedError) {
        console.error(`Error fetching feed ${feed.source}:`, feedError)
        return []
      }
    })

    // Wait for all feeds to complete
    const feedResults = await Promise.all(feedPromises)
    
    // Flatten the results
    for (const feedArticles of feedResults) {
      articles.push(...feedArticles)
    }

    console.log(`📊 Fetched and stored ${articles.length} new articles`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully fetched and stored ${articles.length} new articles`,
      articlesCount: articles.length
    })
  } catch (error) {
    console.error('Error in manual article fetch:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Helper function to update article categories
async function updateArticleCategories(articleId: string, categories: string[]) {
  try {
    // Get or create categories
    const categoryRecords = []
    for (const categoryName of categories) {
      const category = await prisma.category.upsert({
        where: { slug: categoryName.toLowerCase() },
        update: {},
        create: {
          name: categoryName.toUpperCase(),
          slug: categoryName.toLowerCase()
        }
      })
      categoryRecords.push(category)
    }
    
    // Remove existing category associations
    await prisma.articleCategory.deleteMany({
      where: { articleId }
    })
    
    // Add new category associations
    for (const category of categoryRecords) {
      await prisma.articleCategory.upsert({
        where: {
          articleId_categoryId: {
            articleId,
            categoryId: category.id
          }
        },
        update: {},
        create: {
          articleId,
          categoryId: category.id
        }
      })
    }
  } catch (error) {
    console.error(`Error updating categories for article ${articleId}:`, error)
  }
}
