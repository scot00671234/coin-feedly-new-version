import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseRSSFeed, extractImageUrl } from '@/lib/rss-parser'

const RSS_FEEDS = [
  { url: "https://cointelegraph.com/rss", category: "bitcoin", source: "CoinTelegraph" },
  { url: "https://bitcoinist.com/feed/", category: "bitcoin", source: "Bitcoinist" },
  { url: "https://decrypt.co/feed", category: "altcoins", source: "Decrypt" },
  { url: "https://www.blockworks.co/feed", category: "defi", source: "Blockworks" },
  { url: "https://cointelegraph.com/rss", category: "defi", source: "CoinTelegraph" },
  { url: "https://cointelegraph.com/rss", category: "macro", source: "CoinTelegraph" },
  { url: "https://feeds.feedburner.com/CoinDesk", category: "bitcoin", source: "CoinDesk" },
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
              category: feed.category,
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
            
            // Create article
            const article = await prisma.article.create({
              data: {
                title: item.title,
                description: item.description?.replace(/<[^>]*>/g, '').substring(0, 500) || '',
                content: item.content || item.description || '',
                url: item.link,
                publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                imageUrl,
                category: feed.category.toUpperCase(),
                sourceId: source.id
              }
            })
            
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
