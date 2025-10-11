import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseRSSFeed, extractImageUrl } from '@/lib/rss-parser'

export const dynamic = 'force-dynamic'

const RSS_FEEDS = [
  { url: "https://www.coindesk.com/feed/", category: "bitcoin", source: "CoinDesk" },
  { url: "https://cointelegraph.com/rss", category: "altcoins", source: "Cointelegraph" },
  { url: "https://bitcoinist.com/feed/", category: "bitcoin", source: "Bitcoinist" },
  { url: "https://decrypt.co/feed", category: "altcoins", source: "Decrypt" },
  { url: "https://www.theblockcrypto.com/rss", category: "macro", source: "The Block" },
  { url: "https://www.blockworks.co/feed", category: "defi", source: "Blockworks" },
  { url: "https://www.dlnews.com/rss", category: "macro", source: "DL News" },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Check if database is available
    try {
      await prisma.$connect()
    } catch (dbError) {
      console.log('Database not available, fetching fresh articles from RSS feeds')
      const fetchedArticles = await fetchAndStoreArticles()
      return NextResponse.json(fetchedArticles)
    }

    // Fetch articles from database
    let whereClause: any = {}
    
    if (category && category !== 'all') {
      whereClause.category = category
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const articles = await prisma.article.findMany({
      where: whereClause,
      include: {
        source: true
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: limit
    })

    // If no articles in database, fetch from RSS feeds
    if (articles.length === 0) {
      const fetchedArticles = await fetchAndStoreArticles()
      return NextResponse.json(fetchedArticles)
    }

    return NextResponse.json(articles)
  } catch (error) {
    console.error('Error fetching news:', error)
    // Try to fetch fresh articles from RSS feeds on error
    try {
      const fetchedArticles = await fetchAndStoreArticles()
      return NextResponse.json(fetchedArticles)
    } catch (fetchError) {
      console.error('Failed to fetch articles from RSS feeds:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch news articles' }, 
        { status: 500 }
      )
    }
  }
}


async function fetchAndStoreArticles() {
  const articles = []

  for (const feed of RSS_FEEDS) {
    try {
      // Get or create news source
      let source = await prisma.newsSource.findUnique({
        where: { url: feed.url }
      })

      if (!source) {
        source = await prisma.newsSource.create({
          data: {
            name: feed.source,
            url: feed.url,
            category: feed.category
          }
        })
      }

      // Parse RSS feed
      const rssFeed = await parseRSSFeed(feed.url)
      
      for (const item of rssFeed.items.slice(0, 10)) { // Limit to 10 items per feed
        try {
          const imageUrl = extractImageUrl(item)
          
          const articleData = {
            title: item.title || 'Untitled',
            description: item.description?.replace(/<[^>]*>/g, '').substring(0, 500),
            content: item.content || item.description,
            url: item.link || '',
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            imageUrl,
            category: feed.category,
            sourceId: source.id
          }

          // Check if article already exists
          const existingArticle = await prisma.article.findUnique({
            where: { url: articleData.url }
          })

          if (!existingArticle) {
            const article = await prisma.article.create({
              data: articleData,
              include: {
                source: true
              }
            })
            articles.push(article)
          }
        } catch (itemError) {
          console.error(`Error processing article from ${feed.source}:`, itemError)
        }
      }
    } catch (feedError) {
      console.error(`Error fetching feed ${feed.source}:`, feedError)
    }
  }

  return articles
}
