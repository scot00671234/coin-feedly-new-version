'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import CryptoPriceTicker from '@/components/CryptoPriceTicker'
import NewsFeed from '@/components/NewsFeed'
import CategoryFilter from '@/components/CategoryFilter'
import Footer from '@/components/Footer'
import { Article, CryptoPrice } from '@/types'

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [categoryCounts, setCategoryCounts] = useState({ all: 0, bitcoin: 0, altcoins: 0, defi: 0, macro: 0 })

  useEffect(() => {
    fetchNews()
    fetchCryptoPrices()
    fetchCategoryCounts()
  }, [])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery || selectedCategory !== 'all') {
        setSearching(true)
      }
      fetchNews(selectedCategory, searchQuery)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [selectedCategory, searchQuery])

  const fetchNews = async (category = 'all', search = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (category !== 'all') params.append('category', category)
      if (search) params.append('search', search)
      
      console.log('Fetching news with params:', params.toString())
      const response = await fetch(`/api/news?${params.toString()}`)
      const data = await response.json()
      console.log('Received articles:', data.length, 'articles')
      setArticles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching news:', error)
      setArticles([])
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }

  const fetchCryptoPrices = async () => {
    try {
      const response = await fetch('/api/crypto-prices')
      const data = await response.json()
      setCryptoPrices(data)
    } catch (error) {
      console.error('Error fetching crypto prices:', error)
    }
  }

  const fetchCategoryCounts = async () => {
    try {
      const categories = ['all', 'bitcoin', 'altcoins', 'defi', 'macro']
      const counts = { all: 0, bitcoin: 0, altcoins: 0, defi: 0, macro: 0 }
      
      for (const category of categories) {
        const response = await fetch(`/api/news?category=${category}`)
        const data = await response.json()
        counts[category as keyof typeof counts] = Array.isArray(data) ? data.length : 0
      }
      
      setCategoryCounts(counts)
    } catch (error) {
      console.error('Error fetching category counts:', error)
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }


  const categories = [
    { id: 'all', name: 'All News', count: categoryCounts.all },
    { id: 'bitcoin', name: 'Bitcoin', count: categoryCounts.bitcoin },
    { id: 'altcoins', name: 'Altcoins', count: categoryCounts.altcoins },
    { id: 'defi', name: 'DeFi', count: categoryCounts.defi },
    { id: 'macro', name: 'Macro', count: categoryCounts.macro },
  ]

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 relative">
      {/* Blueish subtle glare effect - entire background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-blue-400/8 to-blue-600/12 dark:from-blue-500/15 dark:via-blue-400/8 dark:to-blue-600/12"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/10 via-transparent to-blue-500/8 dark:from-blue-400/10 dark:via-transparent dark:to-blue-500/8"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/25 dark:bg-blue-400/25 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-blue-500/20 dark:bg-blue-500/20 rounded-full blur-3xl translate-x-40 -translate-y-20"></div>
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-blue-600/15 dark:bg-blue-600/15 rounded-full blur-3xl -translate-x-20 translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/18 dark:bg-blue-500/18 rounded-full blur-3xl translate-x-48 translate-y-48"></div>
      
      <Header 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      {/* Spacer for floating header */}
      <div className="h-20"></div>
      
      {/* Crypto Price Ticker */}
      <section className="py-8 bg-slate-200/30 dark:bg-slate-900/30 backdrop-blur-sm border-y border-slate-300/30 dark:border-slate-800/30">
        <CryptoPriceTicker prices={cryptoPrices} />
      </section>
      
      {/* Main Content */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Filters */}
          <div className="mb-16">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={handleCategoryChange}
            />
          </div>
          
          {/* Search Status */}
          {(searching || searchQuery || selectedCategory !== 'all') && (
            <div className="text-center py-4">
              {searching ? (
                <div className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <span>Showing results for:</span>
                  {selectedCategory !== 'all' && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                      {categories.find(c => c.id === selectedCategory)?.name}
                    </span>
                  )}
                  {searchQuery && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                      "{searchQuery}"
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* News Feed */}
          <NewsFeed 
            articles={articles}
            loading={loading}
          />
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
