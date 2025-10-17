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
  { url: "https://cointelegraph.com/rss", categories: ["bitcoin", "altcoins", "defi", "macro"], source: "CoinTelegraph" },
  { url: "https://bitcoinist.com/feed/", categories: ["bitcoin"], source: "Bitcoinist" },
  { url: "https://decrypt.co/feed", categories: ["altcoins", "defi"], source: "Decrypt" },
  { url: "https://www.blockworks.co/feed", categories: ["defi", "macro"], source: "Blockworks" },
  { url: "https://feeds.feedburner.com/CoinDesk", categories: ["bitcoin", "macro", "regulation"], source: "CoinDesk" },
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
    // Always fetch fresh articles from RSS feeds first
    console.log('🔄 Fetching fresh articles from RSS feeds...')
    const fetchedArticles = await fetchAndStoreArticles()
    
    // Also get existing articles from database
    console.log('📚 Fetching existing articles from database...')

    // Fetch articles from database
    let whereClause: any = {}
    
    if (category && category !== 'all') {
      // Use primaryCategory for filtering (most reliable)
      whereClause.primaryCategory = category.toUpperCase()
      console.log(`📊 Filtering by primaryCategory: ${category.toUpperCase()}`)
    }

    if (search) {
      // Enhanced search with better relevance
      const searchTerms = search.toLowerCase().split(' ').filter(term => term.length > 0)
      
      const searchConditions = [
        // Exact title matches get highest priority
        { title: { contains: search, mode: 'insensitive' } },
        // Individual word matches in title
        ...searchTerms.map(term => ({ title: { contains: term, mode: 'insensitive' } })),
        // Description matches
        { description: { contains: search, mode: 'insensitive' } },
        // Individual word matches in description
        ...searchTerms.map(term => ({ description: { contains: term, mode: 'insensitive' } }))
      ]
      
      if (whereClause.OR) {
        // If we already have category filters, combine them with search
        whereClause.AND = [
          { OR: whereClause.OR },
          { OR: searchConditions }
        ]
        delete whereClause.OR
      } else {
        whereClause.OR = searchConditions
      }
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

    console.log('🔍 Database query whereClause:', JSON.stringify(whereClause, null, 2))
    
    const dbArticles = await prisma.article.findMany({
      where: whereClause,
      include: {
        source: true,
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy,
      skip: offset,
      take: limit
    })
    
    console.log(`📊 Found ${dbArticles.length} articles in database for category: ${category}`)
    
    // Combine fresh articles with database articles
    let allArticles: any[] = [...dbArticles]
    
    // If we have fresh articles, add them to the results
    if (fetchedArticles && fetchedArticles.length > 0) {
      console.log(`🆕 Adding ${fetchedArticles.length} fresh articles to results`)
      
      // Filter fresh articles based on category and search
      let filteredFreshArticles = fetchedArticles
      
      if (category && category !== 'all') {
        filteredFreshArticles = filteredFreshArticles.filter(article => {
          return article.primaryCategory?.toLowerCase() === category.toLowerCase()
        })
      }

      if (search) {
        filteredFreshArticles = filteredFreshArticles.filter(article =>
          article.title.toLowerCase().includes(search.toLowerCase()) ||
          (article.description && article.description.toLowerCase().includes(search.toLowerCase()))
        )
      }
      
      // Add fresh articles to the beginning (newest first)
      allArticles = [...filteredFreshArticles, ...allArticles]
    }
    
    // Remove duplicates based on URL
    const uniqueArticles = allArticles.filter((article, index, self) => 
      index === self.findIndex(a => a.url === article.url)
    )
    
    // Apply sorting to combined results
    uniqueArticles.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime()
      const dateB = new Date(b.publishedAt).getTime()
      
      if (sort === 'oldest') {
        return dateA - dateB
      } else {
        return dateB - dateA // newest or relevant
      }
    })
    
    const articles: any[] = uniqueArticles.slice(0, limit)
    
    console.log(`📊 Final result: ${articles.length} articles for category: ${category}`)
    if (articles.length > 0) {
      console.log('📝 First article categories:', articles[0].categories)
      console.log('🏷️ First article primaryCategory:', articles[0].primaryCategory)
      console.log('📰 First article title:', articles[0].title)
    } else {
      console.log('❌ No articles found in database')
      // Let's check if there are any articles at all
      const totalArticles = await prisma.article.count()
      console.log(`📊 Total articles in database: ${totalArticles}`)
      
      // Check articles with primaryCategory
      const articlesWithPrimary = await prisma.article.findMany({
        where: { primaryCategory: category.toUpperCase() },
        take: 5
      })
      console.log(`📊 Articles with primaryCategory ${category.toUpperCase()}: ${articlesWithPrimary.length}`)
      
      // Check articles with category relationships
      const articlesWithCategories = await prisma.article.findMany({
        where: {
          categories: {
            some: {
              category: {
                slug: category.toLowerCase()
              }
            }
          }
        },
        take: 5
      })
      console.log(`📊 Articles with category slug ${category.toLowerCase()}: ${articlesWithCategories.length}`)
    }

    console.log(`Found ${articles.length} articles in database for page ${page}`)
    console.log('Sample article imageUrl:', articles[0]?.imageUrl || 'No image')

    // Check if articles have images, if not fetch fresh from RSS
    const articlesWithoutImages = articles.filter(article => !article.imageUrl)
    console.log(`Articles without images: ${articlesWithoutImages.length}`)

    // Fresh articles are already fetched and combined above

    // Ensure all articles have images and slugs (add fallback if missing)
    const articlesWithImages = articles.map((article, index) => ({
      ...article,
      imageUrl: article.imageUrl || getRandomCryptoImage(article.primaryCategory || 'bitcoin', article.title),
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
        filteredArticles = filteredArticles.filter(article => {
          // Check if article has categories (database articles)
          if ('categories' in article && article.categories && Array.isArray(article.categories)) {
            return article.categories.some(cat => 
              cat.category.slug === category.toLowerCase()
            ) || article.primaryCategory?.toLowerCase() === category.toLowerCase()
          }
          // For RSS articles without categories, check primaryCategory
          return article.primaryCategory?.toLowerCase() === category.toLowerCase()
        })
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
        imageUrl: article.imageUrl || getRandomCryptoImage(article.primaryCategory || 'bitcoin', article.title),
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
  const processedUrls = new Set<string>() // Track processed URLs to prevent duplicates

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
          
          // Skip if we've already processed this URL
          if (processedUrls.has(item.link || '')) {
            continue
          }
          
          const imageUrl = extractImageUrl(item)
          
          // Check if article already exists by URL
          const existingArticle = await prisma.article.findFirst({
            where: { url: item.link || '' },
            include: {
              categories: {
                include: {
                  category: {
                    select: {
                      id: true,
                      name: true,
                      slug: true
                    }
                  }
                }
              }
            }
          })
          
          if (existingArticle) {
            console.log(`Article already exists: ${item.title}`)
            
            // Update categories for existing article
            await updateArticleCategories(existingArticle.id, feed.categories)
            
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
                primaryCategory: feed.categories[0].toUpperCase(), // Use first category as primary
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
                primaryCategory: feed.categories[0].toUpperCase(),
              sourceId: source.id
            },
            include: {
              source: true
            }
          })
          
          // Add categories to the article
          await updateArticleCategories(article.id, feed.categories)
          
          feedArticles.push(article)
          processedUrls.add(item.link || '')
          console.log(`✅ Stored article: ${article.title} with categories: ${feed.categories.join(', ')}`)
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

  console.log(`📊 Fetched and stored ${articles.length} unique articles from RSS feeds`)
  return articles
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
