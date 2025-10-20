// Enhanced article modal with improved content extraction and fallback handling
'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, Clock, User, Image as ImageIcon, AlertCircle } from 'lucide-react'

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
  fallbackReason?: string
  quality?: {
    level: 'high' | 'medium' | 'low' | 'minimal'
    confidence: number
    issues: string[]
    recommendations: string[]
    fallbackStrategy: 'full-content' | 'enhanced-preview' | 'visual-card' | 'external-link'
  }
  score?: {
    textLength: number
    imageCount: number
    structureQuality: number
    readabilityScore: number
    overallConfidence: number
    hasTitle: boolean
    hasDescription: boolean
    hasAuthor: boolean
    hasPublishDate: boolean
    hasImages: boolean
    hasLinks: boolean
    isComplete: boolean
  }
  formatted?: {
    wordCount: number
    readingTime: number
    language?: string
    hasImages: boolean
    hasLinks: boolean
  }
}

interface EnhancedArticleModalProps {
  isOpen: boolean
  onClose: () => void
  articleUrl: string
  rssData?: any
}

export default function EnhancedArticleModal({ 
  isOpen, 
  onClose, 
  articleUrl, 
  rssData 
}: EnhancedArticleModalProps) {
  const [articleData, setArticleData] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (isOpen && articleUrl) {
      fetchArticleContent()
    }
  }, [isOpen, articleUrl])

  const fetchArticleContent = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        url: articleUrl,
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getExtractionMethodColor = (method: string) => {
    switch (method) {
      case 'rss': return 'bg-blue-100 text-blue-800'
      case 'html': return 'bg-green-100 text-green-800'
      case 'api': return 'bg-purple-100 text-purple-800'
      case 'fallback': return 'bg-orange-100 text-orange-800'
      case 'visual': return 'bg-pink-100 text-pink-800'
      case 'ai-generated': return 'bg-indigo-100 text-indigo-800'
      case 'browser': return 'bg-cyan-100 text-cyan-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getQualityBadge = (quality: any) => {
    if (!quality) return { text: 'Unknown', color: 'text-gray-700', bgColor: 'bg-gray-100' }
    
    switch (quality.level) {
      case 'high':
        return { text: 'Full Article', color: 'text-green-700', bgColor: 'bg-green-100' }
      case 'medium':
        return { text: 'Summary', color: 'text-yellow-700', bgColor: 'bg-yellow-100' }
      case 'low':
        return { text: 'Preview', color: 'text-orange-700', bgColor: 'bg-orange-100' }
      case 'minimal':
        return { text: 'External Link', color: 'text-red-700', bgColor: 'bg-red-100' }
      default:
        return { text: 'Unknown', color: 'text-gray-700', bgColor: 'bg-gray-100' }
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid date'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-gray-900">
                {loading ? 'Loading Article...' : 'Article Content'}
              </h2>
              {articleData && (
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExtractionMethodColor(articleData.extractionMethod)}`}>
                    {articleData.extractionMethod.toUpperCase()}
                  </span>
                  <span className={`text-sm font-medium ${getConfidenceColor(articleData.confidence)}`}>
                    {Math.round(articleData.confidence * 100)}% confidence
                  </span>
                  {articleData.quality && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityBadge(articleData.quality).bgColor} ${getQualityBadge(articleData.quality).color}`}>
                      {getQualityBadge(articleData.quality).text}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Extracting article content...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="text-red-800 font-medium">Error Loading Article</h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {articleData && !loading && (
              <div className="space-y-6">
                {/* Article Header */}
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {articleData.title}
                  </h1>
                  
                  {articleData.description && (
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {articleData.description}
                    </p>
                  )}

                  {/* Article Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {articleData.author && (
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{articleData.author}</span>
                      </div>
                    )}
                    
                    {articleData.source && (
                      <div className="flex items-center space-x-1">
                        <ExternalLink className="w-4 h-4" />
                        <span>{articleData.source}</span>
                      </div>
                    )}
                    
                    {articleData.publishedAt && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(articleData.publishedAt)}</span>
                      </div>
                    )}

                    {articleData.formatted && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{articleData.formatted.readingTime} min read</span>
                      </div>
                    )}
                  </div>

                  {/* Extraction Status */}
                  {!articleData.success && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="text-orange-800 font-medium">Content Extraction Limited</p>
                          <p className="text-orange-600 text-sm">
                            {articleData.fallbackReason || 'Using fallback content due to extraction limitations'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Images */}
                {articleData.images && articleData.images.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <ImageIcon className="w-5 h-5" />
                      <span>Images ({articleData.images.length})</span>
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Main Image */}
                      <div className="relative">
                        <img
                          src={articleData.images[currentImageIndex]}
                          alt={articleData.title}
                          className="w-full h-64 object-cover rounded-lg shadow-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder-image.jpg'
                          }}
                        />
                        
                        {articleData.images.length > 1 && (
                          <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-2">
                            {articleData.images.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Image Thumbnails */}
                      {articleData.images.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto">
                          {articleData.images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                                index === currentImageIndex 
                                  ? 'border-blue-500' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <img
                                src={image}
                                alt={`Image ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = '/placeholder-image.jpg'
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Article Content */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Article Content</h3>
                  
                  <div className="prose prose-lg max-w-none">
                    <div 
                      className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: articleData.content.replace(/\n/g, '<br>') 
                      }}
                    />
                  </div>

                  {/* Content Statistics */}
                  {articleData.formatted && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Content Statistics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Words:</span>
                          <span className="ml-1 font-medium">{articleData.formatted.wordCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Reading Time:</span>
                          <span className="ml-1 font-medium">{articleData.formatted.readingTime} min</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Language:</span>
                          <span className="ml-1 font-medium">{articleData.formatted.language || 'Unknown'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Has Images:</span>
                          <span className="ml-1 font-medium">{articleData.formatted.hasImages ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* View Original Button */}
                <div className="pt-4 border-t">
                  <a
                    href={articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Original Article</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
