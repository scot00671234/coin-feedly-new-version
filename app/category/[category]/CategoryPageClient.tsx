'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import ArticleModal from '@/components/ArticleModal'
import { Article } from '@/types'

interface CategoryPageClientProps {
  articles: any[]
  categoryName: string
  category: string
  page: number
  pages: number
}

export default function CategoryPageClient({ articles, categoryName, category, page, pages }: CategoryPageClientProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleArticleClick = (article: any) => {
    // Convert database article to Article type
    const sourceData = article.source as any
    const source: any = {
      id: sourceData.id,
      name: sourceData.name,
      url: sourceData.url,
      primaryCategory: sourceData.primaryCategory || 'BITCOIN',
      isActive: sourceData.isActive || true
    }
    
    const articleData: Article = {
      id: article.id,
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      slug: article.slug,
      publishedAt: article.publishedAt,
      imageUrl: article.imageUrl,
      primaryCategory: article.primaryCategory,
      source: source,
      author: article.author,
      readingTime: article.readingTime,
      viewCount: article.viewCount,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      keywords: article.keywords,
      featuredImage: article.featuredImage
    }
    
    setSelectedArticle(articleData)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 relative">
        {/* Blueish subtle glare effect - entire background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-blue-400/8 to-blue-600/12 dark:from-blue-500/15 dark:via-blue-400/8 dark:to-blue-600/12"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/10 via-transparent to-blue-500/8 dark:from-blue-400/10 dark:via-transparent dark:to-blue-500/8"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/25 dark:bg-blue-400/25 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-blue-500/20 dark:bg-blue-500/20 rounded-full blur-3xl translate-x-40 -translate-y-20"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-blue-600/15 dark:bg-blue-600/15 rounded-full blur-3xl -translate-x-20 translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/18 dark:bg-blue-500/18 rounded-full blur-3xl translate-x-48 translate-y-48"></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
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
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
                onClick={() => handleArticleClick(article)}
              >
                {article.imageUrl && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                      {article.primaryCategory || 'News'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {article.source.name}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {article.title}
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

      {/* Article Modal */}
      <ArticleModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedArticle(null)
        }}
      />
    </>
  )
}
