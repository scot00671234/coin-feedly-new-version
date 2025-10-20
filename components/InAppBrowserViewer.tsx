'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react'
import BrowserHeader from './BrowserHeader'

interface ArticleData {
  success: boolean
  content: string
  title: string
  description: string
  author?: string
  source?: string
  publishedAt?: string
  images: string[]
  confidence: number
  extractionMethod: 'rss' | 'html' | 'api' | 'fallback' | 'visual' | 'ai-generated' | 'browser'
  quality?: {
    level: 'high' | 'medium' | 'low' | 'minimal'
    confidence: number
    issues: string[]
    recommendations: string[]
    fallbackStrategy: 'full-content' | 'enhanced-preview' | 'visual-card' | 'external-link'
  }
  formatted?: {
    wordCount: number
    readingTime: number
    language?: string
    hasImages: boolean
    hasLinks: boolean
  }
}

interface InAppBrowserViewerProps {
  articleUrl: string
  isOpen: boolean
  onClose: () => void
  rssData?: any
}

export default function InAppBrowserViewer({ 
  articleUrl, 
  isOpen, 
  onClose, 
  rssData 
}: InAppBrowserViewerProps) {
  const [articleData, setArticleData] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Extract domain from URL
  const domain = articleUrl ? new URL(articleUrl).hostname : ''

  useEffect(() => {
    if (isOpen && articleUrl) {
      fetchArticleContent()
    }
  }, [isOpen, articleUrl])

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const fetchArticleContent = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        url: articleUrl,
        browserView: 'true',
        readingMode: 'true',
        ...(rssData && { rssData: JSON.stringify(rssData) })
      })
      
      const response = await fetch(`/api/article-content?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setArticleData(data)
      } else {
        setError(data.error || 'Failed to fetch article content')
      }
    } catch (err) {
      setError('Network error occurred while fetching article content')
      console.error('Error fetching article content:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchArticleContent()
  }

  const handleOpenExternal = () => {
    window.open(articleUrl, '_blank', 'noopener,noreferrer')
  }

  const getExtractionMethodColor = (method: string) => {
    switch (method) {
      case 'rss': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'html': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'api': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'fallback': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'visual': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
      case 'ai-generated': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      case 'browser': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="h-full w-full bg-white dark:bg-gray-800 rounded-none md:rounded-lg overflow-hidden flex flex-col">
        {/* Browser Header */}
        <BrowserHeader
          url={articleUrl}
          domain={domain}
          onClose={onClose}
          onRefresh={handleRefresh}
          onOpenExternal={handleOpenExternal}
          loading={loading}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading article content...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md mx-auto p-6">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Unable to Load Article
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {error}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleRefresh}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleOpenExternal}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Original Article</span>
                  </button>
                </div>
              </div>
            </div>
          ) : articleData ? (
            <div className="max-w-4xl mx-auto p-4 md:p-6">
              {/* Article Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExtractionMethodColor(articleData.extractionMethod)}`}>
                    {articleData.extractionMethod.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {Math.round(articleData.confidence * 100)}% confidence
                  </span>
                </div>
                
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {articleData.title}
                </h1>
                
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {articleData.author && (
                    <span>By {articleData.author}</span>
                  )}
                  {articleData.source && (
                    <>
                      <span className="hidden sm:inline">• {articleData.source}</span>
                      <span className="sm:hidden">{articleData.source}</span>
                    </>
                  )}
                  {articleData.publishedAt && (
                    <>
                      <span className="hidden sm:inline">• {new Date(articleData.publishedAt).toLocaleDateString()}</span>
                      <span className="sm:hidden">{new Date(articleData.publishedAt).toLocaleDateString()}</span>
                    </>
                  )}
                </div>

                {articleData.formatted && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>{articleData.formatted.readingTime} min read</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{articleData.formatted.wordCount} words</span>
                    {articleData.formatted.language && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span>{articleData.formatted.language}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Article Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div 
                  className="text-gray-700 dark:text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: articleData.content 
                  }}
                />
              </div>

              {/* Article Footer */}
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Content extracted from {domain}
                  </div>
                  <button
                    onClick={handleOpenExternal}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Read Original
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
