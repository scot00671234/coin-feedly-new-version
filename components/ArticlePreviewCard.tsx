'use client'

import { ExternalLink, Clock, User, Calendar, Globe } from 'lucide-react'

interface ArticlePreviewCardProps {
  article: {
    title: string
    description?: string
    author?: string
    source: {
      name: string
    }
    publishedAt: string
    url: string
    imageUrl?: string
    readingTime?: number
    primaryCategory?: string
  }
}

export default function ArticlePreviewCard({ article }: ArticlePreviewCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Recent'
    }
  }

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'bitcoin':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'altcoins':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'defi':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'macro':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Article Header */}
      <div className="p-8 border-b border-gray-200 dark:border-gray-700">
        {/* Category and Meta */}
        <div className="flex items-center gap-4 mb-4">
          {article.primaryCategory && (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(article.primaryCategory)}`}>
              {article.primaryCategory.toUpperCase()}
            </span>
          )}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Globe className="w-4 h-4 mr-1" />
            <span>{article.source.name}</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
          {article.title}
        </h1>

        {/* Author and Date */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
          {article.author && (
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>By {article.author}</span>
            </div>
          )}
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDate(article.publishedAt)}</span>
          </div>
          {article.readingTime && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{article.readingTime} min read</span>
            </div>
          )}
        </div>

        {/* Featured Image */}
        {article.imageUrl && (
          <div className="aspect-video rounded-lg overflow-hidden mb-6">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Description */}
        {article.description && (
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {article.description}
          </p>
        )}
      </div>

      {/* Preview Content */}
      <div className="p-8">
        <div className="text-center py-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Read the Full Article
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              For the complete article with full formatting, images, and interactive content, 
              visit the original source.
            </p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Read on {article.source.name}
            </a>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>This article is hosted on {article.source.name}</p>
            <p className="mt-1">Click above to read the full content with original formatting</p>
          </div>
        </div>
      </div>
    </div>
  )
}
