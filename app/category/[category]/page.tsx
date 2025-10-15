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
  const limit = 12
  const skip = (page - 1) * limit

  // Ensure category is valid and uppercase
  const categoryFilter = category?.toUpperCase() || 'BITCOIN'

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: {
        categories: {
          some: {
            category: {
              slug: category?.toLowerCase() || 'bitcoin'
            }
          }
        }
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
        categories: {
          some: {
            category: {
              slug: category?.toLowerCase() || 'bitcoin'
            }
          }
        }
      }
    })
  ])

  return { articles, total, pages: Math.ceil(total / limit) }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
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
}
