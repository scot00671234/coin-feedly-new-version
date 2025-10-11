'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/types'
import Header from './Header'
import CryptoPriceTicker from './CryptoPriceTicker'
import NewsFeed from './NewsFeed'
import SearchBar from './SearchBar'

interface CategoryPageProps {
  category: string
  articles: Article[]
}

export default function CategoryPage({ category, articles: initialArticles }: CategoryPageProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(initialArticles)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const categoryNames = {
    bitcoin: 'Bitcoin',
    altcoins: 'Altcoins',
    defi: 'DeFi',
    macro: 'Macro'
  }

  const categoryName = categoryNames[category as keyof typeof categoryNames]

  useEffect(() => {
    filterArticles()
  }, [articles, searchQuery])

  const filterArticles = () => {
    if (!Array.isArray(articles)) {
      setFilteredArticles([])
      return
    }

    let filtered = articles

    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredArticles(filtered)
  }

  const refreshArticles = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/news?category=${category}`)
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
      <Header />
      
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

        {/* Search */}
        <div className="mb-8">
          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
        
        {/* News Feed */}
        <NewsFeed 
          articles={filteredArticles}
          loading={loading}
        />
      </div>
    </main>
  )
}
