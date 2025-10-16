'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import HeaderTicker from '@/components/HeaderTicker'
import NewsFeed from '@/components/NewsFeed'
import CategoryFilter from '@/components/CategoryFilter'
import SortFilter from '@/components/SortFilter'
import Footer from '@/components/Footer'
import { Article, CryptoPrice } from '@/types'

export default function Home() {
  const searchParams = useSearchParams()
  const [allArticles, setAllArticles] = useState<Article[]>([]) // Store all articles
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]) // Display filtered articles
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'relevant'>('newest')
  const [categoryCounts, setCategoryCounts] = useState({ all: 0, bitcoin: 0, altcoins: 0, defi: 0, macro: 0 })
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Initialize from URL params
  useEffect(() => {
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const sort = searchParams.get('sort')
    
    if (search) setSearchQuery(search)
    if (category) setSelectedCategory(category)
    if (sort && ['newest', 'oldest', 'relevant'].includes(sort)) {
      setSortBy(sort as 'newest' | 'oldest' | 'relevant')
    }
  }, [searchParams])

  useEffect(() => {
    fetchNews()
    fetchCryptoPrices()
    fetchCategoryCounts()
  }, [])

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1)
    setHasMore(true)
  }, [selectedCategory, searchQuery, sortBy])

  // Load all articles once
  useEffect(() => {
    fetchNews('all', '', 'newest', 1, true) // Load all articles
  }, [])

  // Filter articles on frontend when category/search/sort changes
  useEffect(() => {
    if (allArticles.length === 0) return
    
    setSearching(true)
    
    let filtered = [...allArticles]
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => {
        const primaryCategory = article.primaryCategory?.toLowerCase()
        return primaryCategory === selectedCategory.toLowerCase()
      })
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        (article.description && article.description.toLowerCase().includes(query))
      )
    }
    
    // Sort articles
    filtered.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime()
      const dateB = new Date(b.publishedAt).getTime()
      
      switch (sortBy) {
        case 'oldest':
          return dateA - dateB
        case 'newest':
          return dateB - dateA
        case 'relevant':
          // Simple relevance based on recency
          return dateB - dateA
        default:
          return dateB - dateA
      }
    })
    
    setFilteredArticles(filtered)
    setSearching(false)
  }, [allArticles, selectedCategory, searchQuery, sortBy])

  const fetchNews = async (category = 'all', search = '', sort = 'newest', pageNum = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      
      const params = new URLSearchParams()
      if (category !== 'all') params.append('category', category)
      if (search) params.append('search', search)
      params.append('sort', sort)
      params.append('page', pageNum.toString())
      params.append('limit', '12')
      
      console.log('🔍 Fetching news with params:', params.toString())
      const response = await fetch(`/api/news?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📰 Received articles:', data.length, 'articles')
      console.log('📊 Sample article:', data[0] ? {
        title: data[0].title,
        category: data[0].primaryCategory,
        publishedAt: data[0].publishedAt
      } : 'No articles')
      
      if (reset) {
        setAllArticles(Array.isArray(data) ? data : [])
        setHasMore(data.length === 12)
      } else {
        setAllArticles(prev => [...prev, ...(Array.isArray(data) ? data : [])])
        setHasMore(data.length === 12)
      }
    } catch (error) {
      console.error('❌ Error fetching news:', error)
      if (reset) {
        setAllArticles([])
      }
    } finally {
      setLoading(false)
      setSearching(false)
      setLoadingMore(false)
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

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchNews(selectedCategory, searchQuery, sortBy, nextPage, false)
    }
  }


  const categories = [
    { id: 'all', name: 'All News', count: categoryCounts.all },
    { id: 'bitcoin', name: 'Bitcoin', count: categoryCounts.bitcoin },
    { id: 'altcoins', name: 'Altcoins', count: categoryCounts.altcoins },
    { id: 'defi', name: 'DeFi', count: categoryCounts.defi },
    { id: 'macro', name: 'Macro', count: categoryCounts.macro },
  ]

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 relative flex-1">
        {/* Blueish subtle glare effect - entire background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-blue-400/8 to-blue-600/12 dark:from-blue-500/15 dark:via-blue-400/8 dark:to-blue-600/12"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/10 via-transparent to-blue-500/8 dark:from-blue-400/10 dark:via-transparent dark:to-blue-500/8"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/25 dark:bg-blue-400/25 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-blue-500/20 dark:bg-blue-500/20 rounded-full blur-3xl translate-x-40 -translate-y-20"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-blue-600/15 dark:bg-blue-600/15 rounded-full blur-3xl -translate-x-20 translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/18 dark:bg-blue-500/18 rounded-full blur-3xl translate-x-48 translate-y-48"></div>
        
        
        {/* Crypto Price Ticker */}
        <HeaderTicker prices={cryptoPrices} />
        
        {/* Main Content */}
        <section className="py-8 relative z-10 w-full">
          <div className="w-full px-6">
            {/* Filters and Sort */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={handleCategoryChange}
                />
                <SortFilter
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              </div>
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
              articles={filteredArticles}
              loading={loading}
              loadingMore={loadingMore}
              hasMore={hasMore}
              onLoadMore={loadMore}
            />
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
