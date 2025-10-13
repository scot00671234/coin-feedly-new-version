import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'

export const metadata: Metadata = {
  title: 'Crypto News Blog | Bitcoin Updates & Cryptocurrency RSS Feed',
  description: 'Stay updated with the latest cryptocurrency news, Bitcoin updates, and blockchain insights. Your ultimate crypto RSS feed for market analysis and trading news.',
  keywords: 'crypto news blog, bitcoin updates, cryptocurrency RSS feed, blockchain news, crypto trading news, altcoin updates, DeFi news, crypto market analysis',
  openGraph: {
    title: 'Crypto News Blog | Bitcoin Updates & Cryptocurrency RSS Feed',
    description: 'Stay updated with the latest cryptocurrency news, Bitcoin updates, and blockchain insights.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crypto News Blog | Bitcoin Updates & Cryptocurrency RSS Feed',
    description: 'Stay updated with the latest cryptocurrency news, Bitcoin updates, and blockchain insights.',
  },
  alternates: {
    canonical: '/blog',
  },
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  keywords: string[]
  featuredImage: string | null
  author: string
  readingTime: number | null
  viewCount: number
  publishedAt: string
  metaTitle: string | null
  metaDescription: string | null
}

interface BlogPageProps {
  searchParams: {
    page?: string
    search?: string
    keyword?: string
  }
}

async function getBlogPosts(page: number = 1, search?: string, keyword?: string) {
  const limit = 12
  const skip = (page - 1) * limit

  const where = {
    isPublished: true,
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { content: { contains: search, mode: 'insensitive' as const } },
        { excerpt: { contains: search, mode: 'insensitive' as const } }
      ]
    }),
    ...(keyword && {
      keywords: { has: keyword }
    })
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { publishedAt: 'desc' }
      ],
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        keywords: true,
        featuredImage: true,
        author: true,
        readingTime: true,
        viewCount: true,
        publishedAt: true,
        metaTitle: true,
        metaDescription: true
      }
    }),
    prisma.blogPost.count({ where })
  ])

  return { posts, total, pages: Math.ceil(total / limit) }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const page = parseInt(searchParams.page || '1')
  const { posts, total, pages } = await getBlogPosts(
    page,
    searchParams.search,
    searchParams.keyword
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Crypto News Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Stay updated with the latest cryptocurrency news, Bitcoin updates, and blockchain insights. 
            Your ultimate crypto RSS feed for market analysis and trading news.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search blog posts..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white">
              <option value="">All Categories</option>
              <option value="bitcoin">Bitcoin</option>
              <option value="ethereum">Ethereum</option>
              <option value="defi">DeFi</option>
              <option value="trading">Trading</option>
              <option value="blockchain">Blockchain</option>
            </select>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {post.featuredImage && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.keywords.slice(0, 3).map((keyword) => (
                    <span
                      key={keyword}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {post.metaTitle || post.title}
                  </Link>
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {post.metaDescription || post.excerpt || 'Read more about this crypto news...'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <span>{post.author}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}</span>
                    {post.readingTime && (
                      <>
                        <span>•</span>
                        <span>{post.readingTime} min read</span>
                      </>
                    )}
                  </div>
                  <span>{post.viewCount} views</span>
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
                  href={`/blog?page=${pageNum}`}
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
            Your Ultimate Crypto News RSS Feed
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Welcome to the most comprehensive crypto news blog on the web. We provide real-time updates on Bitcoin, 
              Ethereum, and thousands of altcoins, delivering the latest cryptocurrency news directly to your RSS feed.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Our crypto RSS feed aggregates news from the most trusted sources in the industry, ensuring you never 
              miss important Bitcoin updates, DeFi developments, or blockchain innovations. Whether you're a day trader, 
              long-term investor, or simply curious about cryptocurrency, our blog has you covered.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Why Choose Our Crypto News Blog?
            </h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Real-time Bitcoin updates and price analysis</li>
              <li>Comprehensive cryptocurrency RSS feed</li>
              <li>Expert analysis on DeFi and blockchain technology</li>
              <li>Market insights and trading strategies</li>
              <li>Regular updates on regulatory developments</li>
              <li>Mobile-optimized for reading on any device</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}