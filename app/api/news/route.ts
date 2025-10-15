import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseRSSFeed, extractImageUrl } from '@/lib/rss-parser'
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
  { url: "https://cointelegraph.com/rss", category: "bitcoin", source: "CoinTelegraph" },
  { url: "https://bitcoinist.com/feed/", category: "bitcoin", source: "Bitcoinist" },
  { url: "https://decrypt.co/feed", category: "altcoins", source: "Decrypt" },
  { url: "https://www.blockworks.co/feed", category: "defi", source: "Blockworks" },
  { url: "https://cointelegraph.com/rss", category: "defi", source: "CoinTelegraph" },
  { url: "https://cointelegraph.com/rss", category: "macro", source: "CoinTelegraph" },
  // Fallback feeds
  { url: "https://feeds.feedburner.com/CoinDesk", category: "bitcoin", source: "CoinDesk" },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'all'
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const offset = (page - 1) * limit

  console.log('API Request - Category:', category, 'Search:', search, 'Sort:', sort, 'Limit:', limit)

  try {
    // Check if database is available and has tables
    let databaseAvailable = false
    try {
      await prisma.$connect()
      // Try to query a simple table to check if it exists
      await prisma.article.findFirst()
      databaseAvailable = true
    } catch (dbError) {
      console.log('Database not available or tables missing, fetching fresh articles from RSS feeds')
      databaseAvailable = false
    }

    if (!databaseAvailable) {
      const fetchedArticles = await fetchAndStoreArticles()
      
      // Apply filters to fetched articles
      let filteredArticles = fetchedArticles
      
      if (category && category !== 'all') {
        filteredArticles = filteredArticles.filter(article => article.category === category.toUpperCase())
      }

      if (search) {
        filteredArticles = filteredArticles.filter(article =>
          article.title.toLowerCase().includes(search.toLowerCase()) ||
          (article.description && article.description.toLowerCase().includes(search.toLowerCase()))
        )
      }

      // Ensure all articles have images and slugs
      const articlesWithImages = filteredArticles.map((article, index) => ({
        ...article,
        imageUrl: article.imageUrl || getRandomCryptoImage(article.category, article.title),
        slug: article.slug || `${generateSlug(article.title)}-${index}`
      }))

      return NextResponse.json(articlesWithImages.slice(offset, offset + limit), {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      })
    }

    // Fetch articles from database
    let whereClause: any = {}
    
    if (category && category !== 'all') {
      whereClause.category = category.toUpperCase()
    }

    if (search) {
      // Enhanced search with better relevance
      const searchTerms = search.toLowerCase().split(' ').filter(term => term.length > 0)
      
      whereClause.OR = [
        // Exact title matches get highest priority
        { title: { contains: search, mode: 'insensitive' } },
        // Individual word matches in title
        ...searchTerms.map(term => ({ title: { contains: term, mode: 'insensitive' } })),
        // Description matches
        { description: { contains: search, mode: 'insensitive' } },
        // Individual word matches in description
        ...searchTerms.map(term => ({ description: { contains: term, mode: 'insensitive' } }))
      ]
    }

    // Determine sort order
    let orderBy: any = {}
    if (sort === 'oldest') {
      orderBy.publishedAt = 'asc'
    } else if (sort === 'relevant' && search) {
      // For relevance, we'll sort by publishedAt desc but this could be enhanced with full-text search
      orderBy.publishedAt = 'desc'
    } else {
      orderBy.publishedAt = 'desc' // newest
    }

    const articles = await prisma.article.findMany({
      where: whereClause,
      include: {
        source: true
      },
      orderBy,
      skip: offset,
      take: limit
    })

    console.log(`Found ${articles.length} articles in database for page ${page}`)
    console.log('Sample article imageUrl:', articles[0]?.imageUrl || 'No image')

    // Check if articles have images, if not fetch fresh from RSS
    const articlesWithoutImages = articles.filter(article => !article.imageUrl)
    console.log(`Articles without images: ${articlesWithoutImages.length}`)

    // If no articles in database or many articles missing images, fetch from RSS feeds
    if (articles.length === 0 || articlesWithoutImages.length > articles.length * 0.5) {
      console.log('Fetching fresh articles from RSS feeds...')
      const fetchedArticles = await fetchAndStoreArticles()
      
      // Apply filters to fetched articles
      let filteredArticles = fetchedArticles
      
      if (category && category !== 'all') {
        filteredArticles = filteredArticles.filter(article => article.category === category.toUpperCase())
      }

      if (search) {
        filteredArticles = filteredArticles.filter(article =>
          article.title.toLowerCase().includes(search.toLowerCase()) ||
          (article.description && article.description.toLowerCase().includes(search.toLowerCase()))
        )
      }

      // Apply sorting
      filteredArticles.sort((a, b) => {
        const dateA = new Date(a.publishedAt).getTime()
        const dateB = new Date(b.publishedAt).getTime()
        
        if (sort === 'oldest') {
          return dateA - dateB
        } else {
          return dateB - dateA // newest or relevant
        }
      })

      // Ensure all articles have images and slugs
      const articlesWithImages = filteredArticles.map((article, index) => ({
        ...article,
        imageUrl: article.imageUrl || getRandomCryptoImage(article.category, article.title),
        slug: article.slug || `${generateSlug(article.title)}-${index}`
      }))

      return NextResponse.json(articlesWithImages.slice(offset, offset + limit), {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      })
    }

    // Ensure all articles have images and slugs (add fallback if missing)
    const articlesWithImages = articles.map((article, index) => ({
      ...article,
      imageUrl: article.imageUrl || getRandomCryptoImage(article.category, article.title),
      slug: article.slug || `${generateSlug(article.title)}-${index}`
    }))

    return NextResponse.json(articlesWithImages, {
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
        filteredArticles = filteredArticles.filter(article => article.category === category.toUpperCase())
      }

      if (search) {
        filteredArticles = filteredArticles.filter(article =>
          article.title.toLowerCase().includes(search.toLowerCase()) ||
          (article.description && article.description.toLowerCase().includes(search.toLowerCase()))
        )
      }

      // Apply sorting
      filteredArticles.sort((a, b) => {
        const dateA = new Date(a.publishedAt).getTime()
        const dateB = new Date(b.publishedAt).getTime()
        
        if (sort === 'oldest') {
          return dateA - dateB
        } else {
          return dateB - dateA // newest or relevant
        }
      })

      // Ensure all articles have images and slugs
      const articlesWithImages = filteredArticles.map((article, index) => ({
        ...article,
        imageUrl: article.imageUrl || getRandomCryptoImage(article.category, article.title),
        slug: article.slug || `${generateSlug(article.title)}-${index}`
      }))

      return NextResponse.json(articlesWithImages.slice(offset, offset + limit), {
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

  // Process feeds in parallel for better performance
  const feedPromises = RSS_FEEDS.map(async (feed) => {
    try {
      // Parse RSS feed directly without database
      const rssFeed = await parseRSSFeed(feed.url)
      
      if (!rssFeed.items || !Array.isArray(rssFeed.items)) {
        console.warn(`No items found in feed ${feed.source}`)
        return []
      }
      
      const feedArticles = []
      for (const item of rssFeed.items.slice(0, 10)) { // Limit to 10 items per feed
        try {
          // Validate item has required fields
          if (!item.title && !item.description) {
            continue
          }
          
          const imageUrl = extractImageUrl(item)
          
          // Check if article already exists by URL
          const existingArticle = await prisma.article.findFirst({
            where: { url: item.link || '' }
          })
          
          if (existingArticle) {
            console.log(`Article already exists: ${item.title}`)
            // Update the existing article with new data if needed
            try {
              await prisma.article.update({
                where: { id: existingArticle.id },
                data: {
                  title: item.title || existingArticle.title,
                  description: item.description?.replace(/<[^>]*>/g, '').substring(0, 500) || existingArticle.description,
                  content: item.content || item.description || existingArticle.content,
                  publishedAt: item.pubDate ? new Date(item.pubDate) : existingArticle.publishedAt,
                  imageUrl: imageUrl || existingArticle.imageUrl,
                  updatedAt: new Date()
                }
              })
              console.log(`✅ Updated existing article: ${item.title}`)
            } catch (updateError) {
              console.error(`Error updating existing article: ${updateError}`)
            }
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
          
          // Create article in database
          const article = await prisma.article.create({
            data: {
              title: item.title || 'Untitled',
              description: item.description?.replace(/<[^>]*>/g, '').substring(0, 500) || '',
              content: item.content || item.description || '',
              url: item.link || '',
              slug: uniqueSlug,
              publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
              imageUrl,
              category: feed.category.toUpperCase(),
              sourceId: source.id
            },
            include: {
              source: true
            }
          })
          
          feedArticles.push(article)
          console.log(`✅ Stored article: ${article.title}`)
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

  console.log(`📊 Fetched and stored ${articles.length} articles from RSS feeds`)
  return articles
}
