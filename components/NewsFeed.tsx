'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { Article } from '@/types'
import NewsCard from './NewsCard'
import { formatDistanceToNow } from 'date-fns'

interface NewsFeedProps {
  articles: Article[]
  loading: boolean
}

export default function NewsFeed({ articles, loading }: NewsFeedProps) {
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const articlesPerPage = 12

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  const loadMoreArticles = useCallback(() => {
    if (loading || !hasMore) return

    const startIndex = (page - 1) * articlesPerPage
    const endIndex = startIndex + articlesPerPage
    const newArticles = articles.slice(startIndex, endIndex)

    if (newArticles.length === 0) {
      setHasMore(false)
      return
    }

    setDisplayedArticles(prev => [...prev, ...newArticles])
    setPage(prev => prev + 1)

    if (endIndex >= articles.length) {
      setHasMore(false)
    }
  }, [articles, page, loading, hasMore, articlesPerPage])

  // Load initial articles
  useEffect(() => {
    if (articles.length > 0 && displayedArticles.length === 0) {
      const initialArticles = articles.slice(0, articlesPerPage)
      setDisplayedArticles(initialArticles)
      setPage(2)
      setHasMore(articles.length > articlesPerPage)
    }
  }, [articles, displayedArticles.length, articlesPerPage])

  // Load more when in view
  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMoreArticles()
    }
  }, [inView, hasMore, loading, loadMoreArticles])

  if (loading && displayedArticles.length === 0) {
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

  if (displayedArticles.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-4">No articles found</div>
        <div className="text-gray-500">Try adjusting your search or filter criteria</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedArticles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>

      {/* Load More Trigger */}
      {hasMore && (
        <div ref={ref} className="flex justify-center py-8">
          {loading ? (
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
              <span>Loading more articles...</span>
            </div>
          ) : (
            <div className="text-gray-500">Scroll to load more articles</div>
          )}
        </div>
      )}

      {/* End of Results */}
      {!hasMore && displayedArticles.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          You've reached the end of the articles
        </div>
      )}
    </div>
  )
}
