import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseRSSFeed, extractImageUrl } from '@/lib/rss-parser'

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
      await prisma.articleCategory.create({
        data: {
          articleId,
          categoryId: category.id
        }
      })
    }
  } catch (error) {
    console.error(`Error updating categories for article ${articleId}:`, error)
  }
}

const RSS_FEEDS = [
  { url: "https://cointelegraph.com/rss", categories: ["bitcoin", "altcoins", "defi", "macro"], source: "CoinTelegraph" },
  { url: "https://bitcoinist.com/feed/", categories: ["bitcoin"], source: "Bitcoinist" },
  { url: "https://decrypt.co/feed", categories: ["altcoins", "defi", "web3"], source: "Decrypt" },
  { url: "https://www.blockworks.co/feed", categories: ["defi", "macro"], source: "Blockworks" },
  { url: "https://feeds.feedburner.com/CoinDesk", categories: ["bitcoin", "macro", "regulation"], source: "CoinDesk" },
]

export async function GET() {
  try {
    console.log('🚀 Starting article fetch and store process...')
    
    let totalStored = 0
    
    // Process each feed
    for (const feed of RSS_FEEDS) {
      try {
        console.log(`📡 Fetching from ${feed.source}...`)
        const rssFeed = await parseRSSFeed(feed.url)
        
        if (!rssFeed.items || !Array.isArray(rssFeed.items)) {
          console.warn(`No items found in feed ${feed.source}`)
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
              category: feed.categories[0], // Use first category as primary
              isActive: true
            }
          })
          console.log(`✅ Created source: ${feed.source}`)
        }
        
        // Process articles
        for (const item of rssFeed.items.slice(0, 10)) {
          try {
            if (!item.title || !item.link) {
              continue
            }
            
            // Check if article already exists
            const existingArticle = await prisma.article.findFirst({
              where: { url: item.link }
            })
            
            if (existingArticle) {
              continue
            }
            
            const imageUrl = extractImageUrl(item)
            
            // Generate slug for the article
            const generateSlug = (title: string): string => {
              return title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
                .substring(0, 100)
            }
            
            let articleSlug = generateSlug(item.title)
            
            // Check if slug already exists and make it unique
            let counter = 1
            let uniqueSlug = articleSlug
            while (await prisma.article.findFirst({ where: { slug: uniqueSlug } })) {
              uniqueSlug = `${articleSlug}-${counter}`
              counter++
            }
            
            // Create article
            const article = await prisma.article.create({
              data: {
                title: item.title,
                description: item.description?.replace(/<[^>]*>/g, '').substring(0, 500) || '',
                content: item.content || item.description || '',
                url: item.link,
                slug: uniqueSlug,
                publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                imageUrl,
                primaryCategory: feed.categories[0].toUpperCase(),
                sourceId: source.id
              }
            })
            
            // Add categories to the article
            await updateArticleCategories(article.id, feed.categories)
            
            totalStored++
            console.log(`✅ Stored: ${article.title.substring(0, 50)}...`)
            
          } catch (itemError) {
            console.error(`Error processing article:`, itemError)
          }
        }
        
      } catch (feedError) {
        console.error(`Error fetching feed ${feed.source}:`, feedError)
      }
    }
    
    console.log(`🎉 Successfully stored ${totalStored} new articles`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully stored ${totalStored} new articles`,
      count: totalStored
    })
    
  } catch (error) {
    console.error('Error in fetch-articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch and store articles' },
      { status: 500 }
    )
  }
}
