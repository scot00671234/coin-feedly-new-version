'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Article } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, Clock, Tag, Image as ImageIcon } from 'lucide-react'
import { getImageUrl, getCryptoPlaceholderImage } from '@/lib/image-utils'

interface NewsCardProps {
  article: Article
}

export default function NewsCard({ article }: NewsCardProps) {
  const [imageError, setImageError] = useState(false)
  
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

  // Generate slug for the article if it doesn't exist
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 100)
  }

  const articleSlug = article.slug || generateSlug(article.title)

  // Get the best available image - always ensure we have one
  const imageUrl = getImageUrl(article.imageUrl, article.title, article.category) || getCryptoPlaceholderImage(article.category, article.title)
  
  // Debug logging
  console.log(`Article "${article.title.substring(0, 30)}..." - Original imageUrl: ${article.imageUrl}, Final imageUrl: ${imageUrl}`)

  return (
    <Link href={`/article/${articleSlug}`}>
      <article className="bg-slate-200/40 dark:bg-slate-800/40 hover:bg-slate-300/40 dark:hover:bg-slate-700/40 border border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400/50 dark:hover:border-slate-600/50 rounded-xl p-6 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl group">
      {/* Image */}
      <div className="relative h-56 w-full mb-6 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-700">
        {!imageError ? (
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No image available</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-4 left-4">
          <span className={`category-badge ${getCategoryClass(article.category)}`}>
            <Tag className="w-3 h-3 mr-1" />
            {article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-5">
        {/* Source */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-400 font-semibold">{article.source.name}</span>
          <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-500">
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

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
          {article.title}
        </h3>

        {/* Description */}
        {article.description && (
          <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 leading-relaxed">
            {article.description.replace(/<[^>]*>/g, '')}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-300/50 dark:border-slate-800/50">
          <div className="flex items-center space-x-2 text-blue-400 group-hover:text-blue-300 transition-colors">
            <ExternalLink className="w-4 h-4" />
            <span className="font-semibold text-sm">Read Full Article</span>
          </div>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <ExternalLink className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
      </article>
    </Link>
  )
}
