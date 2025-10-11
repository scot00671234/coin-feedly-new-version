'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import CryptoPriceTicker from '@/components/CryptoPriceTicker'
import NewsFeed from '@/components/NewsFeed'
import CategoryFilter from '@/components/CategoryFilter'
import SearchBar from '@/components/SearchBar'
import { Article, CryptoPrice } from '@/types'

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
    fetchCryptoPrices()
  }, [])

  useEffect(() => {
    filterArticles()
  }, [articles, selectedCategory, searchQuery])

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news')
      const data = await response.json()
      setArticles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching news:', error)
      setArticles([])
    } finally {
      setLoading(false)
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

  const filterArticles = () => {
    if (!Array.isArray(articles)) {
      setFilteredArticles([])
      return
    }

    let filtered = articles

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredArticles(filtered)
  }

  const categories = [
    { id: 'all', name: 'All News', count: Array.isArray(articles) ? articles.length : 0 },
    { id: 'bitcoin', name: 'Bitcoin', count: Array.isArray(articles) ? articles.filter(a => a.category === 'bitcoin').length : 0 },
    { id: 'altcoins', name: 'Altcoins', count: Array.isArray(articles) ? articles.filter(a => a.category === 'altcoins').length : 0 },
    { id: 'defi', name: 'DeFi', count: Array.isArray(articles) ? articles.filter(a => a.category === 'defi').length : 0 },
    { id: 'macro', name: 'Macro', count: Array.isArray(articles) ? articles.filter(a => a.category === 'macro').length : 0 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 relative">
      {/* Blueish subtle glare effect - entire background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-blue-400/8 to-blue-600/12 dark:from-blue-500/15 dark:via-blue-400/8 dark:to-blue-600/12"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/10 via-transparent to-blue-500/8 dark:from-blue-400/10 dark:via-transparent dark:to-blue-500/8"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/25 dark:bg-blue-400/25 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-blue-500/20 dark:bg-blue-500/20 rounded-full blur-3xl translate-x-40 -translate-y-20"></div>
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-blue-600/15 dark:bg-blue-600/15 rounded-full blur-3xl -translate-x-20 translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/18 dark:bg-blue-500/18 rounded-full blur-3xl translate-x-48 translate-y-48"></div>
      
      <Header />
      
      {/* Spacer for floating header */}
      <div className="h-20"></div>
      
      {/* Crypto Price Ticker */}
      <section className="py-8 bg-slate-200/30 dark:bg-slate-900/30 backdrop-blur-sm border-y border-slate-300/30 dark:border-slate-800/30">
        <CryptoPriceTicker prices={cryptoPrices} />
      </section>
      
      {/* Main Content */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Search and Filters */}
          <div className="mb-16">
            
            <div className="max-w-3xl mx-auto mb-8">
              <SearchBar 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
            
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>
          
          {/* News Feed */}
          <NewsFeed 
            articles={filteredArticles}
            loading={loading}
          />
        </div>
      </section>
    </div>
  )
}
