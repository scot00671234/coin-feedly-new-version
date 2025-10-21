'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/types'
import { ExternalLink, Clock, TrendingUp } from 'lucide-react'

interface LiveNewsFeedProps {
  limit?: number
  showHeader?: boolean
  className?: string
}

export default function LiveNewsFeed({ 
  limit = 6, 
  showHeader = true,
  className = '' 
}: LiveNewsFeedProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/news?limit=20')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setArticles(data.slice(0, limit))
    } catch (err) {
      console.error('Error fetching news:', err)
      setError('Failed to load news')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [limit])

  const formatTimeAgo = (dateString: string | Date) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'bitcoin':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'altcoins':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'defi':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'macro':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-8 ${className}`}>
        {showHeader && (
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Live News Feed</h2>
          </div>
        )}
        
        <div className="space-y-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-8 ${className}`}>
        {showHeader && (
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Live News Feed</h2>
          </div>
        )}
        
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️ Error loading news</div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <button 
            onClick={fetchNews}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-8 ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Live News Feed</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live updates</span>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {articles.map((article, index) => (
          <article 
            key={`${article.id}-${index}`}
            className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl p-6 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="flex gap-4">
              {/* Article Image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
                {article.imageUrl ? (
                  <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-slate-400" />
                  </div>
                )}
              </div>
              
              {/* Article Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.primaryCategory)}`}>
                    {article.primaryCategory}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(article.publishedAt)}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium">{article.source.name}</span>
                    <span>•</span>
                    <span>{article.author || 'Unknown'}</span>
                  </div>
                  
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg"
                    title="Read full article"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      {articles.length === 0 && !loading && (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">No news articles available</p>
        </div>
      )}
    </div>
  )
}
