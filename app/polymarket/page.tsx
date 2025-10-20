'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, TrendingUp, DollarSign, Calendar, RefreshCw } from 'lucide-react'
import Footer from '@/components/Footer'

interface PolymarketData {
  id: string
  title: string
  description: string
  probability: number
  volume: number
  resolutionDate: string
  resolutionDateISO: string
  outcomes: string[]
  outcomePrices: number[]
  polymarketUrl: string
  createdAt: string
  updatedAt: string
}

interface PolymarketResponse {
  success: boolean
  markets: PolymarketData[]
  lastUpdated: string
  error?: string
}

export default function PolymarketPage() {
  const [markets, setMarkets] = useState<PolymarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchMarkets = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/polymarket?limit=5')
      const data: PolymarketResponse = await response.json()
      
      if (data.success) {
        setMarkets(data.markets)
        setLastUpdated(data.lastUpdated)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch markets')
        setMarkets([])
      }
    } catch (err) {
      setError('Network error while fetching markets')
      setMarkets([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMarkets()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMarkets, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`
    }
    return `$${volume.toFixed(0)}`
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-green-500'
    if (probability >= 40) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getProbabilityBarColor = (probability: number) => {
    if (probability >= 70) return 'bg-green-500'
    if (probability >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-slate-600 dark:text-slate-400">Loading Polymarket data...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Polymarket Predictions
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Live crypto prediction markets from Polymarket
              </p>
            </div>
            <button
              onClick={fetchMarkets}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          {lastUpdated && (
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Markets Grid */}
        {markets.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {markets.map((market) => (
              <div
                key={market.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white pr-4">
                    {market.title}
                  </h3>
                  <a
                    href={market.polymarketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Polymarket
                  </a>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                  {market.description}
                </p>

                {/* Probability Display */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Current Probability
                    </span>
                    <span className={`text-2xl font-bold ${getProbabilityColor(market.probability)}`}>
                      {market.probability}%
                    </span>
                  </div>
                  
                  {/* Probability Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProbabilityBarColor(market.probability)}`}
                      style={{ width: `${market.probability}%` }}
                    />
                  </div>
                </div>

                {/* Market Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Volume</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatVolume(market.volume)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Resolution</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {market.resolutionDate}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Outcomes */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Outcomes</p>
                  <div className="flex gap-4">
                    {market.outcomes.map((outcome, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {outcome}
                        </span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {Math.round((market.outcomePrices[index] || 0) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No markets available
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Unable to fetch prediction markets at this time.
            </p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}
