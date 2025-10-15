import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import { Clock, ExternalLink, ArrowLeft, Share2, Eye, Calendar, User } from 'lucide-react'

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

// Fetch article content from external URL
async function fetchArticleContent(url: string) {
  try {
    // Create an AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CoinFeedly/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    
    // Extract main content using simple regex patterns
    const contentMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                        html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                        html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                        html.match(/<div[^>]*class="[^"]*post[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
    
    if (contentMatch) {
      return contentMatch[1]
    }
    
    // Fallback: extract content between common content indicators
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) {
      return bodyMatch[1]
    }
    
    return null
  } catch (error) {
    console.error('Error fetching article content:', error)
    return null
  }
}

interface ArticlePageProps {
  params: {
    slug: string
  }
}

async function getArticle(slug: string) {
  console.log(`🔍 Looking for article with slug: ${slug}`)
  
  try {
    // First try to fetch from the article API using the slug
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/article/${slug}`, {
      cache: 'no-store'
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ Found article in database: ${data.article.title}`)
      
      // Fetch external article content if we have a URL
      let externalContent = null
      if (data.article.url) {
        externalContent = await fetchArticleContent(data.article.url)
      }
      
      return {
        article: data.article,
        relatedArticles: data.relatedArticles || [],
        externalContent
      }
    }
    
    // If not found in database, try to find by title match in news API
    console.log(`❌ Article not found in database, searching news API...`)
    
    const newsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/news?limit=100`, {
      cache: 'no-store'
    })
    
    if (!newsResponse.ok) {
      throw new Error('Failed to fetch articles')
    }
    
    const newsData = await newsResponse.json()
    const articles = newsData.articles || []
    
    console.log(`📊 Fetched ${articles.length} articles from news API`)
    
    // Convert slug back to title for search
    const titleFromSlug = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    console.log(`🔍 Searching for title: ${titleFromSlug}`)
    
    // Find article by title match
    const article = articles.find((art: any) => 
      art.title.toLowerCase().includes(titleFromSlug.toLowerCase()) ||
      titleFromSlug.toLowerCase().includes(art.title.toLowerCase())
    )
    
    if (article) {
      console.log(`✅ Found article in news API: ${article.title}`)
      
      // Fetch external article content if we have a URL
      let externalContent = null
      if (article.url) {
        externalContent = await fetchArticleContent(article.url)
      }
      
      return {
        article,
        relatedArticles: articles.filter((art: any) => 
          art.category === article.category && art.id !== article.id
        ).slice(0, 4),
        externalContent
      }
    } else {
      console.log(`❌ No article found for slug: ${slug}`)
      return null
    }
    
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const data = await getArticle(params.slug)
  
  if (!data) {
    return {
      title: 'Article Not Found',
    }
  }

  const { article } = data
  const title = article.seoTitle || article.title
  const description = article.seoDescription || article.description || 'Read the latest cryptocurrency news and analysis.'

  return {
    title: `${title} | Coin Feedly`,
    description,
    keywords: article.keywords ? article.keywords.join(', ') : '',
    openGraph: {
      title: `${title} | Coin Feedly`,
      description,
      type: 'article',
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: article.author ? [article.author] : [article.source.name],
      images: article.featuredImage || article.imageUrl ? [article.featuredImage || article.imageUrl!] : [],
      siteName: 'Coin Feedly',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Coin Feedly`,
      description,
      images: article.featuredImage || article.imageUrl ? [article.featuredImage || article.imageUrl!] : [],
    },
    alternates: {
      canonical: `/article/${article.slug}`,
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const data = await getArticle(params.slug)
  
  if (!data) {
    notFound()
  }

  const { article, relatedArticles, externalContent } = data

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.featuredImage || article.imageUrl,
    author: {
      '@type': 'Person',
      name: article.author || article.source.name
    },
    publisher: {
      '@type': 'Organization',
      name: 'Coin Feedly',
      logo: {
        '@type': 'ImageObject',
        url: 'https://coinfeedly.com/icon.svg'
      }
    },
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://coinfeedly.com/article/${article.slug}`
    },
    keywords: article.keywords ? article.keywords.join(', ') : '',
    wordCount: article.content ? article.content.split(' ').length : 0,
    timeRequired: article.readingTime ? `PT${article.readingTime}M` : undefined,
    about: {
      '@type': 'Thing',
      name: article.category
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
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link></li>
              <li>/</li>
              <li><Link href={`/category/${article.category.toLowerCase()}`} className="hover:text-blue-600 dark:hover:text-blue-400 capitalize">{article.category}</Link></li>
              <li>/</li>
              <li className="text-gray-900 dark:text-white truncate">{article.title}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <article className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                {/* Article Header */}
                <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                  {/* Category and Meta */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm font-medium rounded-full">
                      {article.category.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                    </span>
                    {article.readingTime && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {article.readingTime} min read
                      </span>
                    )}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {article.viewCount + 1} views
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {article.title}
                  </h1>

                  {/* Author and Source */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                    <span>By {article.author || article.source.name}</span>
                    <span>•</span>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      View Original
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>

                  {/* Featured Image */}
                  {(article.featuredImage || article.imageUrl) && (
                    <div className="aspect-video rounded-lg overflow-hidden mb-6">
                      <img
                        src={article.featuredImage || article.imageUrl!}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Description */}
                  {article.description && (
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                      {article.description}
                    </p>
                  )}
                </div>

                {/* Embedded Content */}
                <div className="p-8">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Full Article Content
                      </h2>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Embedded from {article.source.name}
                      </div>
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white">
                    {externalContent ? (
                      <div dangerouslySetInnerHTML={{ __html: externalContent }} />
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8">
                          <ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Article Content Unavailable
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-6">
                            We couldn't load the full article content. This might be due to the source website's restrictions or network issues.
                          </p>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Read Full Article on {article.source.name}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SEO Content Enhancement */}
                  <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Key Takeaways
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Stay updated with the latest {article.category.toLowerCase()} news and market analysis</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Get expert insights on cryptocurrency trends and developments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Access real-time crypto prices and market data</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              {/* Related Articles */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Related {article.category} News
                </h3>
                <div className="space-y-4">
                  {relatedArticles.map((relatedArticle: any) => (
                    <Link
                      key={relatedArticle.id}
                      href={`/article/${relatedArticle.slug || generateSlug(relatedArticle.title)}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        {relatedArticle.imageUrl && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={relatedArticle.imageUrl}
                              alt={relatedArticle.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                            {relatedArticle.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {relatedArticle.source.name} • {formatDistanceToNow(new Date(relatedArticle.publishedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* SEO Content */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Stay Updated
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Get the latest {article.category.toLowerCase()} news and crypto market updates delivered to your feed.
                </p>
                <Link
                  href={`/category/${article.category.toLowerCase()}`}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  View All {article.category} News
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
