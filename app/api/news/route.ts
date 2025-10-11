import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseRSSFeed, extractImageUrl } from '@/lib/rss-parser'

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
      console.log('Database not available, returning mock data')
      return NextResponse.json(getMockArticles(category, search, limit))
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
    // Return mock data on error
    return NextResponse.json(getMockArticles())
  }
}

function getMockArticles(category?: string | null, search?: string | null, limit: number = 50) {
  const mockArticles = [
    {
      id: '1',
      title: 'Bitcoin Reaches New All-Time High as Institutional Adoption Grows',
      description: 'Major corporations continue to add Bitcoin to their balance sheets, driving the cryptocurrency to unprecedented price levels.',
      content: 'Bitcoin has reached a new all-time high as institutional adoption continues to grow...',
      url: 'https://example.com/bitcoin-ath',
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=400&fit=crop',
      category: 'bitcoin',
      source: {
        id: '1',
        name: 'CoinDesk',
        url: 'https://coindesk.com'
      }
    },
    {
      id: '2',
      title: 'Ethereum 2.0 Staking Rewards Hit Record Highs',
      description: 'Ethereum stakers are seeing unprecedented rewards as the network continues its transition to proof-of-stake.',
      content: 'Ethereum 2.0 staking has become increasingly profitable...',
      url: 'https://example.com/ethereum-staking',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop',
      category: 'altcoins',
      source: {
        id: '2',
        name: 'Cointelegraph',
        url: 'https://cointelegraph.com'
      }
    },
    {
      id: '3',
      title: 'DeFi Protocol Launches Revolutionary Yield Farming Strategy',
      description: 'A new DeFi protocol introduces an innovative approach to yield farming that could change the landscape.',
      content: 'The DeFi space continues to innovate with new yield farming strategies...',
      url: 'https://example.com/defi-yield-farming',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1639322537504-6427a16b0a28?w=800&h=400&fit=crop',
      category: 'defi',
      source: {
        id: '3',
        name: 'Blockworks',
        url: 'https://blockworks.co'
      }
    },
    {
      id: '4',
      title: 'Federal Reserve Signals Potential Digital Dollar Development',
      description: 'The Fed is exploring the possibility of a central bank digital currency as part of its monetary policy toolkit.',
      content: 'The Federal Reserve is taking steps toward developing a digital dollar...',
      url: 'https://example.com/fed-digital-dollar',
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
      category: 'macro',
      source: {
        id: '4',
        name: 'The Block',
        url: 'https://theblockcrypto.com'
      }
    },
    {
      id: '5',
      title: 'Bitcoin Mining Difficulty Adjusts Downward as Hash Rate Stabilizes',
      description: 'The Bitcoin network has adjusted its mining difficulty downward, making it more profitable for miners.',
      content: 'Bitcoin mining difficulty has decreased following recent network adjustments...',
      url: 'https://example.com/bitcoin-mining-difficulty',
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=400&fit=crop',
      category: 'bitcoin',
      source: {
        id: '1',
        name: 'Bitcoinist',
        url: 'https://bitcoinist.com'
      }
    }
  ]

  let filtered = mockArticles

  if (category && category !== 'all') {
    filtered = filtered.filter(article => article.category === category)
  }

  if (search) {
    filtered = filtered.filter(article =>
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.description.toLowerCase().includes(search.toLowerCase())
    )
  }

  return filtered.slice(0, limit)
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
