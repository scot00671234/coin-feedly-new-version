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
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const limit = parseInt(searchParams.get('limit') || '50')

  console.log('API Request - Category:', category, 'Search:', search, 'Limit:', limit)

  try {

    // Check if database is available
    try {
      await prisma.$connect()
    } catch (dbError) {
      console.log('Database not available, fetching fresh articles from RSS feeds')
      const fetchedArticles = await fetchAndStoreArticles()
      
      // Apply filters to fetched articles
      let filteredArticles = fetchedArticles
      
      if (category && category !== 'all') {
        filteredArticles = filteredArticles.filter(article => article.category === category)
      }

      if (search) {
        filteredArticles = filteredArticles.filter(article =>
          article.title.toLowerCase().includes(search.toLowerCase()) ||
          (article.description && article.description.toLowerCase().includes(search.toLowerCase()))
        )
      }

      return NextResponse.json(filteredArticles.slice(0, limit), {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      })
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
      
      // Apply filters to fetched articles
      let filteredArticles = fetchedArticles
      
      if (category && category !== 'all') {
        filteredArticles = filteredArticles.filter(article => article.category === category)
      }

      if (search) {
        filteredArticles = filteredArticles.filter(article =>
          article.title.toLowerCase().includes(search.toLowerCase()) ||
          (article.description && article.description.toLowerCase().includes(search.toLowerCase()))
        )
      }

      return NextResponse.json(filteredArticles.slice(0, limit), {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      })
    }

    return NextResponse.json(articles, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    // Try to fetch fresh articles from RSS feeds on error
    try {
      const fetchedArticles = await fetchAndStoreArticles()
      
      // Apply filters to fetched articles
      let filteredArticles = fetchedArticles
      
      if (category && category !== 'all') {
        filteredArticles = filteredArticles.filter(article => article.category === category)
      }

      if (search) {
        filteredArticles = filteredArticles.filter(article =>
          article.title.toLowerCase().includes(search.toLowerCase()) ||
          (article.description && article.description.toLowerCase().includes(search.toLowerCase()))
        )
      }

      return NextResponse.json(filteredArticles.slice(0, limit), {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      })
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
      // Parse RSS feed directly without database
      const rssFeed = await parseRSSFeed(feed.url)
      
      for (const item of rssFeed.items.slice(0, 10)) { // Limit to 10 items per feed
        try {
          const imageUrl = extractImageUrl(item)
          
          const article = {
            id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: item.title || 'Untitled',
            description: item.description?.replace(/<[^>]*>/g, '').substring(0, 500),
            content: item.content || item.description,
            url: item.link || '',
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            imageUrl,
            category: feed.category,
            source: {
              id: `temp-source-${feed.source}`,
              name: feed.source,
              url: feed.url
            }
          }
          
          articles.push(article)
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
