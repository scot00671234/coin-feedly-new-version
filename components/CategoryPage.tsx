'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/types'
import UnifiedHeader from './UnifiedHeader'
import CryptoPriceTicker from './CryptoPriceTicker'
import NewsFeed from './NewsFeed'
import Footer from './Footer'

interface CategoryPageProps {
  category: string
  articles: Article[]
}

export default function CategoryPage({ category, articles: initialArticles }: CategoryPageProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const categoryNames = {
    bitcoin: 'Bitcoin',
    altcoins: 'Altcoins',
    defi: 'DeFi',
    macro: 'Macro'
  }

  const categoryName = categoryNames[category as keyof typeof categoryNames]

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshArticles()
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const refreshArticles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('category', category)
      if (searchQuery) params.append('search', searchQuery)
      
      const response = await fetch(`/api/news?${params.toString()}`)
      const data = await response.json()
      setArticles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error refreshing articles:', error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      <UnifiedHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {categoryName} News
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Stay updated with the latest {categoryName.toLowerCase()} news, analysis, and market insights 
            from top cryptocurrency sources.
          </p>
          <button
            onClick={refreshArticles}
            disabled={loading}
            className="mt-4 btn-primary disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh News'}
          </button>
        </div>
        
        {/* News Feed */}
        <NewsFeed 
          articles={articles}
          loading={loading}
        />
      </div>
      
      {/* Footer */}
      <Footer />
    </main>
  )
}
