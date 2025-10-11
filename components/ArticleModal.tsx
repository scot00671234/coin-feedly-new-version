'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/types'
import { X, ExternalLink, Clock, Tag, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ArticleModalProps {
  article: Article | null
  isOpen: boolean
  onClose: () => void
}

export default function ArticleModal({ article, isOpen, onClose }: ArticleModalProps) {
  const [articleContent, setArticleContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && article) {
      fetchArticleContent()
    }
  }, [isOpen, article])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const fetchArticleContent = async () => {
    if (!article) return

    setLoading(true)
    setError(null)

    try {
      // Try to fetch the full article content
      const response = await fetch(`/api/article-content?url=${encodeURIComponent(article.url)}`)
      
      if (response.ok) {
        const data = await response.json()
        setArticleContent(data.content || article.content || article.description)
      } else {
        // Fallback to existing content
        setArticleContent(article.content || article.description || null)
      }
    } catch (err) {
      console.error('Error fetching article content:', err)
      setError('Failed to load full article content')
      // Fallback to existing content
      setArticleContent(article.content || article.description || null)
    } finally {
      setLoading(false)
    }
  }

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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
  }

  const handleExternalLink = () => {
    window.open(article?.url, '_blank', 'noopener,noreferrer')
  }

  if (!isOpen || !article) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-3">
                <span className={`category-badge ${getCategoryClass(article.category)}`}>
                  <Tag className="w-3 h-3 mr-1" />
                  {article.category}
                </span>
                <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {formatDistanceToNow(
                      article.publishedAt instanceof Date 
                        ? article.publishedAt 
                        : new Date(article.publishedAt), 
                      { addSuffix: true }
                    )}
                  </span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {article.title}
              </h1>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  By {article.source.name}
                </span>
                <button
                  onClick={handleExternalLink}
                  className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">View Original</span>
                </button>
              </div>
            </div>
            <button
              onClick={handleCloseClick}
              className="ml-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Image */}
        {article.imageUrl && (
          <div className="relative h-64 w-full overflow-hidden">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-slate-600 dark:text-slate-400">Loading article content...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-2">{error}</div>
              <div className="text-slate-600 dark:text-slate-400">
                Showing available content below
              </div>
            </div>
          ) : null}

          {articleContent && (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div 
                className="text-slate-700 dark:text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: articleContent.replace(/<[^>]*>/g, '').replace(/\n/g, '<br>') 
                }}
              />
            </div>
          )}

          {!articleContent && !loading && (
            <div className="text-center py-12 text-slate-500">
              <p>No content available for this article.</p>
              <button
                onClick={handleExternalLink}
                className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Read on Original Site</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Stay updated with the latest crypto news
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCloseClick}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleExternalLink}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Read Full Article
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
