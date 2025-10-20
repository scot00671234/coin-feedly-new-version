'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import InAppBrowserViewer from './InAppBrowserViewer'
import ArticlePreviewCard from './ArticlePreviewCard'

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

interface IntelligentArticleContentProps {
  article: any
  externalContent: string | null
  articleData?: ArticleData | null
  loading?: boolean
  error?: string | null
}

export default function IntelligentArticleContent({ 
  article, 
  externalContent, 
  articleData,
  loading = false,
  error = null
}: IntelligentArticleContentProps) {
  const [showBrowserView, setShowBrowserView] = useState(false)

  // Determine display mode based on confidence and content quality
  const getDisplayMode = () => {
    // If we have article data from API, use its confidence
    if (articleData) {
      return articleData.confidence >= 0.8 ? 'browser' : 'preview'
    }
    
    // If we have external content, assume it's good enough for browser view
    if (externalContent && externalContent.length > 200) {
      return 'browser'
    }
    
    // Otherwise, show preview card
    return 'preview'
  }

  const displayMode = getDisplayMode()

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading article content...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-8">
            <div className="text-red-500 mb-4">
              <ExternalLink className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Unable to Load Article
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error}
            </p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Original Source
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Content Display */}
      <div className="p-8">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {displayMode === 'browser' ? 'Article Content' : 'Article Preview'}
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {displayMode === 'browser' ? 'Enhanced reading experience' : 'Preview mode'}
            </div>
          </div>
        </div>

        {displayMode === 'browser' ? (
          // High confidence - show browser viewer
          <div className="space-y-4">
            <div className="prose dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white">
              {externalContent ? (
                <div dangerouslySetInnerHTML={{ __html: externalContent }} />
              ) : articleData?.content ? (
                <div dangerouslySetInnerHTML={{ __html: articleData.content }} />
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
                      Visit {article.source.name}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Browser View Button */}
            <div className="flex justify-center pt-6">
              <button
                onClick={() => setShowBrowserView(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Open in Browser View
              </button>
            </div>
          </div>
        ) : (
          // Low confidence - show preview card
          <ArticlePreviewCard article={article} />
        )}
      </div>

      {/* Browser Viewer Modal */}
      {showBrowserView && article.url && (
        <InAppBrowserViewer
          articleUrl={article.url}
          isOpen={showBrowserView}
          onClose={() => setShowBrowserView(false)}
        />
      )}
    </>
  )
}
