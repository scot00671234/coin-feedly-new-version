'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import Footer from '@/components/Footer'

interface CategoryPageClientProps {
  articles: any[]
  categoryName: string
  category: string
  page: number
  pages: number
}

export default function CategoryPageClient({ articles, categoryName, category, page, pages }: CategoryPageClientProps) {
  const [sortedArticles, setSortedArticles] = useState(articles)
  const [loading, setLoading] = useState(false)

  // Update articles when they change
  useEffect(() => {
    setSortedArticles(articles)
  }, [articles])
  const getCategoryClass = (category: string) => {
    switch (category) {
      case 'bitcoin':
        return 'category-bitcoin'
      case 'altcoins':
        return 'category-altcoins'
      case 'defi':
        return 'category-defi'
      case 'macro':
        return 'category-macro'
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-900 flex flex-col">
      <div className="w-full relative flex-1">
        {/* Modern news-style header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
          <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
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
              {loading ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : sortedArticles.length > 0 ? (
                sortedArticles.map((article) => (
                <Link key={article.id} href={`/article/${article.slug || article.id}`}>
                  <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer group">
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
                        <span className={`category-badge ${getCategoryClass(article.primaryCategory || 'bitcoin')}`}>
                          {article.primaryCategory || 'News'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {article.source?.name || 'RSS Feed'}
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
                        <span>{article.viewCount || 0} views</span>
                      </div>
                    </div>
                  </article>
                </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">No articles found</div>
                  <div className="text-gray-400 dark:text-gray-500">Try adjusting your search or filter criteria</div>
                </div>
              )}
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
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}