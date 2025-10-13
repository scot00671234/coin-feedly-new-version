import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'

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
      where: { category: categoryFilter },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      include: {
        source: true
      }
    }),
    prisma.article.count({
      where: { category: categoryFilter }
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
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {categoryName} News & Analysis
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Stay updated with the latest {categoryName.toLowerCase()} news, market analysis, and expert insights. 
              Get comprehensive coverage of {categoryName.toLowerCase()} developments and trends.
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                {article.imageUrl && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {article.source.name}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    <Link 
                      href={`/article/${article.slug}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {article.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {article.description || 'Read the latest crypto news and analysis...'}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                      {article.readingTime && (
                        <>
                          <span>•</span>
                          <span>{article.readingTime} min read</span>
                        </>
                      )}
                    </div>
                    <span>{article.viewCount} views</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center">
              <div className="flex gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={`/category/${category}?page=${pageNum}`}
                    className={`px-4 py-2 rounded-lg ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* SEO Content */}
          <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Your Ultimate {categoryName} News Source
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Welcome to the most comprehensive {categoryName.toLowerCase()} news coverage on the web. 
                We provide real-time updates, expert analysis, and market insights to keep you informed 
                about the latest developments in the {categoryName.toLowerCase()} space.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our {categoryName.toLowerCase()} news section aggregates content from the most trusted sources 
                in the industry, ensuring you never miss important updates, price movements, or regulatory 
                developments that could impact your investments and trading decisions.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Why Choose Our {categoryName} News Coverage?
              </h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                <li>Real-time {categoryName.toLowerCase()} updates and price analysis</li>
                <li>Expert analysis from industry professionals</li>
                <li>Comprehensive market coverage and trends</li>
                <li>Regulatory updates and compliance news</li>
                <li>Technical analysis and trading insights</li>
                <li>Mobile-optimized for reading on any device</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
