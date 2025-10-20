'use client'

import { useState, useEffect } from 'react'
import { CryptoPrice, formatPrice, formatMarketCap, formatVolume, formatPercentage } from '@/lib/crypto-api'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'

export default function ChartsPage() {
  const router = useRouter()
  const [cryptos, setCryptos] = useState<CryptoPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [sortBy, setSortBy] = useState<'market_cap' | 'price' | 'volume' | 'change_24h'>('market_cap')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [tickerPrices, setTickerPrices] = useState<CryptoPrice[]>([])

  useEffect(() => {
    fetchCryptos()
    fetchTickerPrices()
  }, [page, sortBy, sortOrder])

  // Auto-refresh ticker prices every 60 seconds to avoid rate limits
  useEffect(() => {
    const interval = setInterval(fetchTickerPrices, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchTickerPrices = async () => {
    try {
      // Use real-time endpoint for consistent pricing
      const response = await fetch('/api/crypto-realtime', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setTickerPrices(data)
    } catch (error) {
      console.error('Error fetching real-time ticker prices:', error)
    }
  }

  // Auto-search effect with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch()
      } else if (searchQuery === '') {
        // Reset to show all cryptos when search is cleared
        setPage(1)
        fetchCryptos()
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const fetchCryptos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/crypto?action=list&page=${page}&perPage=50`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      if (page === 1) {
        setCryptos(data)
      } else {
        setCryptos(prev => [...prev, ...data])
      }
      
      setHasMore(data.length === 50)
    } catch (error) {
      console.error('Error fetching cryptos:', error)
      setError('Failed to load cryptocurrency data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setPage(1)
      fetchCryptos()
      return
    }

    try {
      setLoading(true)
      setError(null)
      setPage(1)
      const response = await fetch(`/api/crypto?action=search&query=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setCryptos(data)
      setHasMore(false)
    } catch (error) {
      console.error('Error searching cryptos:', error)
      setError('Failed to search cryptocurrencies. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCryptoClick = (crypto: CryptoPrice) => {
    router.push(`/crypto/${crypto.id}`)
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  const sortedCryptos = [...cryptos].sort((a, b) => {
    let aValue: number, bValue: number

    switch (sortBy) {
      case 'market_cap':
        aValue = a.market_cap || 0
        bValue = b.market_cap || 0
        break
      case 'price':
        aValue = a.current_price || 0
        bValue = b.current_price || 0
        break
      case 'volume':
        aValue = a.total_volume || 0
        bValue = b.total_volume || 0
        break
      case 'change_24h':
        aValue = a.price_change_percentage_24h || 0
        bValue = b.price_change_percentage_24h || 0
        break
      default:
        return 0
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      
      {/* Crypto Price Ticker */}

      {/* Filters Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Mobile Layout */}
          <div className="block sm:hidden space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Sort by:</span>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
              >
                {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'market_cap', label: 'Market Cap' },
                { value: 'price', label: 'Price' },
                { value: 'volume', label: 'Volume' },
                { value: 'change_24h', label: '24h Change' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={`px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                    sortBy === option.value
                      ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Sort by:</span>
              <div className="flex items-center space-x-1">
                {[
                  { value: 'market_cap', label: 'Market Cap' },
                  { value: 'price', label: 'Price' },
                  { value: 'volume', label: 'Volume' },
                  { value: 'change_24h', label: '24h Change' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as any)}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                      sortBy === option.value
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              <span className="text-xs uppercase tracking-wide">
                {sortOrder === 'asc' ? 'Asc' : 'Desc'}
              </span>
              {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error loading data
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setError(null)
                        fetchCryptos()
                      }}
                      className="bg-red-100 dark:bg-red-800 px-3 py-2 rounded-md text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Crypto List */}
          <div className="w-full">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Cryptocurrencies</h2>
              </div>
              
              {/* Mobile Layout - Cards */}
              <div className="block sm:hidden">
                <div className="space-y-3 p-4">
                  {sortedCryptos.map((crypto) => (
                    <div
                      key={crypto.id}
                      onClick={() => handleCryptoClick(crypto)}
                      className="bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 rounded-xl p-4 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-300/50 dark:hover:border-blue-400/50 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            #{crypto.market_cap_rank}
                          </div>
                          <img
                            src={crypto.image}
                            alt={crypto.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                              {crypto.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                              {crypto.symbol}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {formatPrice(crypto.current_price)}
                          </div>
                          <div className={`text-xs flex items-center justify-end ${
                            (crypto.price_change_percentage_24h || 0) >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {(crypto.price_change_percentage_24h || 0) >= 0 ? (
                              <ArrowUp className="w-3 h-3 mr-1" />
                            ) : (
                              <ArrowDown className="w-3 h-3 mr-1" />
                            )}
                            {formatPercentage(crypto.price_change_percentage_24h)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <div className="text-slate-500 dark:text-slate-400 mb-1">1h</div>
                          <div className={`font-medium ${
                            (crypto.price_change_percentage_1h_in_currency || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {formatPercentage(crypto.price_change_percentage_1h_in_currency)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 dark:text-slate-400 mb-1">7d</div>
                          <div className={`font-medium ${
                            (crypto.price_change_percentage_7d_in_currency || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {formatPercentage(crypto.price_change_percentage_7d_in_currency)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 dark:text-slate-400 mb-1">Market Cap</div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {formatMarketCap(crypto.market_cap)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Layout - Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">1h</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">24h</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">7d</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Market Cap</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                    {sortedCryptos.map((crypto) => (
                      <tr
                        key={crypto.id}
                        onClick={() => handleCryptoClick(crypto)}
                        className="hover:bg-slate-100 dark:hover:bg-slate-700/30 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                          {crypto.market_cap_rank}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={crypto.image}
                              alt={crypto.name}
                              className="w-8 h-8 rounded-full mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">{crypto.name}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 uppercase">{crypto.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                          {formatPrice(crypto.current_price)}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                          (crypto.price_change_percentage_1h_in_currency || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatPercentage(crypto.price_change_percentage_1h_in_currency)}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                          (crypto.price_change_percentage_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatPercentage(crypto.price_change_percentage_24h)}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                          (crypto.price_change_percentage_7d_in_currency || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatPercentage(crypto.price_change_percentage_7d_in_currency)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                          {formatMarketCap(crypto.market_cap)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                          {formatVolume(crypto.total_volume)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {loading && (
                <div className="p-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              )}

              {hasMore && !loading && (
                <div className="p-4 text-center">
                  <button
                    onClick={loadMore}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
