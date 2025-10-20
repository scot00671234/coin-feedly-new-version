'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { Article } from '@/types'
import NewsCard from './NewsCard'
import { formatDistanceToNow } from 'date-fns'

interface NewsFeedProps {
  articles: Article[]
  loading: boolean
  loadingMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
}

export default function NewsFeed({ articles, loading, loadingMore = false, hasMore = true, onLoadMore }: NewsFeedProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  // Load more when in view
  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore && onLoadMore) {
      onLoadMore()
    }
  }, [inView, hasMore, loading, loadingMore, onLoadMore])

  if (loading && articles.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="news-card">
            <div className="skeleton h-48 w-full mb-4"></div>
            <div className="skeleton h-4 w-3/4 mb-2"></div>
            <div className="skeleton h-4 w-full mb-2"></div>
            <div className="skeleton h-4 w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (articles.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative">
            {/* Animated loading spinner */}
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin border-t-blue-500 mx-auto mb-4"></div>
            {/* Pulsing dots */}
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>

      {/* Load More Trigger */}
      {hasMore && (
        <div ref={ref} className="flex justify-center py-8">
          {loadingMore ? (
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Loading more articles...</span>
            </div>
          ) : (
            <div className="text-gray-500">Scroll to load more articles</div>
          )}
        </div>
      )}

      {/* End of Results */}
      {!hasMore && articles.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          You've reached the end of the articles
        </div>
      )}
    </div>
  )
}
