import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import CategoryPageClient from './CategoryPageClient'

interface CategoryPageProps {
  params: {
    category: string
  }
  searchParams: {
    page?: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = params.category
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
  
  const categoryTitles = {
    'bitcoin': 'Bitcoin News & Analysis | Latest BTC Updates & Price Trends',
    'altcoins': 'Altcoin News & Analysis | Ethereum, Solana & Crypto Updates',
    'defi': 'DeFi News & Analysis | Decentralized Finance Updates & Protocols',
    'macro': 'Crypto Market Analysis | Macro Trends & Regulatory News',
    'trading': 'Cryptocurrency Trading News | Market Analysis & Trading Insights',
    'blockchain': 'Blockchain Technology News | Network Updates & Innovations'
  }

  const categoryDescriptions = {
    'bitcoin': 'Stay updated with the latest Bitcoin news, price analysis, and market trends. Get expert insights on BTC developments, institutional adoption, and trading opportunities.',
    'altcoins': 'Comprehensive altcoin news and analysis covering Ethereum, Solana, and other major cryptocurrencies. Stay informed about altcoin market trends and developments.',
    'defi': 'Latest DeFi news, protocol updates, and decentralized finance analysis. Stay ahead of yield farming opportunities and DeFi market trends.',
    'macro': 'Crypto market analysis, regulatory updates, and macroeconomic trends affecting cryptocurrency prices and adoption worldwide.',
    'trading': 'Cryptocurrency trading news, technical analysis, and market insights for traders and investors. Get the latest crypto trading strategies and updates.',
    'blockchain': 'Blockchain technology news, network upgrades, and enterprise adoption updates. Stay informed about the latest blockchain innovations and developments.'
  }

  const title = categoryTitles[category as keyof typeof categoryTitles] || `${categoryName} News | Coin Feedly`
  const description = categoryDescriptions[category as keyof typeof categoryDescriptions] || `Latest ${categoryName.toLowerCase()} news and analysis. Stay updated with cryptocurrency market trends and developments.`

  return {
    title,
    description,
    keywords: `${categoryName.toLowerCase()}, crypto news, cryptocurrency, blockchain, ${categoryName.toLowerCase()} analysis, crypto market`,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/category/${category}`,
    },
  }
}

async function getCategoryArticles(category: string, page: number = 1) {
  try {
    const limit = 12
    const skip = (page - 1) * limit

    // Map category slugs to valid CategoryType values
    const categoryMap: Record<string, string> = {
      'bitcoin': 'BITCOIN',
      'altcoins': 'ALTCOINS', 
      'defi': 'DEFI',
      'macro': 'MACRO',
    }

    // Get the valid category or default to BITCOIN
    const categoryFilter = categoryMap[category?.toLowerCase()] || 'BITCOIN'
    
    console.log(`🔍 Category filter: ${categoryFilter}, slug: ${category?.toLowerCase()}`)

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          OR: [
            { primaryCategory: categoryFilter as any },
            {
              categories: {
                some: {
                  category: {
                    slug: category.toLowerCase()
                  }
                }
              }
            }
          ]
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        include: {
          source: {
            select: {
              id: true,
              name: true,
              url: true,
              primaryCategory: true,
              isActive: true
            }
          },
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
      }),
      prisma.article.count({
        where: {
          OR: [
            { primaryCategory: categoryFilter as any },
            {
              categories: {
                some: {
                  category: {
                    slug: category.toLowerCase()
                  }
                }
              }
            }
          ]
        }
      })
    ])

    console.log(`📊 Found ${articles.length} articles for category ${categoryFilter}`)
    if (articles.length > 0) {
      console.log(`📝 Sample article: ${articles[0].title} - Primary: ${articles[0].primaryCategory}`)
    }

    return { articles, total, pages: Math.ceil(total / limit) }
  } catch (error) {
    console.error('Error fetching category articles:', error)
    // Return empty results instead of throwing
    return { articles: [], total: 0, pages: 0 }
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  try {
    const category = params.category
    const page = parseInt(searchParams.page || '1')
    const { articles, total, pages } = await getCategoryArticles(category, page)

    const categoryName = category.charAt(0).toUpperCase() + category.slice(1)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} News`,
    description: `Latest ${categoryName.toLowerCase()} news and analysis`,
    url: `https://coinfeedly.com/category/${category}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: total,
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          headline: article.title,
          url: `https://coinfeedly.com/article/${article.slug}`,
          datePublished: article.publishedAt.toISOString(),
          author: {
            '@type': 'Person',
            name: article.author || article.source.name
          }
        }
      }))
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <CategoryPageClient
        articles={articles}
        categoryName={categoryName}
        category={category}
        page={page}
        pages={pages}
      />
    </>
  )
  } catch (error) {
    console.error('Error in CategoryPage:', error)
    // Return a fallback page instead of crashing
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Category Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The requested category could not be found or is temporarily unavailable.
            </p>
            <a
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    )
  }
}
