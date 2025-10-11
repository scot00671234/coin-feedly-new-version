'use client'

import { useState } from 'react'
import { Article } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, Clock, Tag } from 'lucide-react'
import ArticleModal from './ArticleModal'

interface NewsCardProps {
  article: Article
}

export default function NewsCard({ article }: NewsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  const handleClick = () => {
    setIsModalOpen(true)
  }

  return (
    <article 
      className="bg-slate-200/40 dark:bg-slate-800/40 hover:bg-slate-300/40 dark:hover:bg-slate-700/40 border border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400/50 dark:hover:border-slate-600/50 rounded-xl p-6 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl group"
      onClick={handleClick}
    >
      {/* Image */}
      {article.imageUrl && (
        <div className="relative h-56 w-full mb-6 overflow-hidden rounded-2xl">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-4 left-4">
            <span className={`category-badge ${getCategoryClass(article.category)}`}>
              <Tag className="w-3 h-3 mr-1" />
              {article.category}
            </span>
          </div>
        </div>
      )}

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

      {/* Article Modal */}
      <ArticleModal 
        article={article}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </article>
  )
}
