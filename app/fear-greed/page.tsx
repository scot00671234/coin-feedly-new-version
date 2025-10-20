'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, AlertTriangle, Info, Clock, Activity } from 'lucide-react'
import Footer from '@/components/Footer'

interface FearGreedData {
  value: number
  classification: string
  timestamp: string
  timeUntilUpdate?: string
}

interface FearGreedResponse {
  success: boolean
  data?: FearGreedData
  error?: string
  lastUpdated: string
  cached?: boolean
  fallback?: boolean
}

export default function FearGreedPage() {
  const [data, setData] = useState<FearGreedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchFearGreedData = async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true)
      
      const response = await fetch('/api/fear-greed')
      const result: FearGreedResponse = await response.json()
      
      if (result.success && result.data) {
        setData(result.data)
        setLastUpdated(result.lastUpdated)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch fear & greed data')
        if (result.data) {
          setData(result.data) // Use fallback data if available
        }
      }
    } catch (err) {
      setError('Network error while fetching fear & greed data')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFearGreedData()
    
    // Auto-refresh every 30 minutes
    const interval = setInterval(() => fetchFearGreedData(), 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getClassificationColor = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'extreme fear':
        return 'text-red-600 dark:text-red-400'
      case 'fear':
        return 'text-orange-600 dark:text-orange-400'
      case 'neutral':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'greed':
        return 'text-green-600 dark:text-green-400'
      case 'extreme greed':
        return 'text-emerald-600 dark:text-emerald-400'
      default:
        return 'text-slate-600 dark:text-slate-400'
    }
  }

  const getClassificationBgColor = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'extreme fear':
        return 'bg-red-500'
      case 'fear':
        return 'bg-orange-500'
      case 'neutral':
        return 'bg-yellow-500'
      case 'greed':
        return 'bg-green-500'
      case 'extreme greed':
        return 'bg-emerald-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getValueColor = (value: number) => {
    if (value <= 25) return 'text-red-600 dark:text-red-400'
    if (value <= 45) return 'text-orange-600 dark:text-orange-400'
    if (value <= 55) return 'text-yellow-600 dark:text-yellow-400'
    if (value <= 75) return 'text-green-600 dark:text-green-400'
    return 'text-emerald-600 dark:text-emerald-400'
  }

  const getValueBgColor = (value: number) => {
    if (value <= 25) return 'bg-red-500'
    if (value <= 45) return 'bg-orange-500'
    if (value <= 55) return 'bg-yellow-500'
    if (value <= 75) return 'bg-green-500'
    return 'bg-emerald-500'
  }

  const getMarketSentiment = (value: number) => {
    if (value <= 25) return 'Extreme Fear - Market is oversold, potential buying opportunity'
    if (value <= 45) return 'Fear - Market sentiment is negative, caution advised'
    if (value <= 55) return 'Neutral - Market sentiment is balanced'
    if (value <= 75) return 'Greed - Market sentiment is positive, watch for overvaluation'
    return 'Extreme Greed - Market may be overbought, consider taking profits'
  }

  const getRecommendation = (value: number) => {
    if (value <= 25) return 'Consider buying opportunities as market may be oversold'
    if (value <= 45) return 'Be cautious but look for quality assets at discounted prices'
    if (value <= 55) return 'Maintain balanced portfolio and regular investment strategy'
    if (value <= 75) return 'Consider taking some profits and rebalancing portfolio'
    return 'Consider reducing exposure and taking profits as market may be overbought'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-slate-600 dark:text-slate-400">Loading Fear & Greed Index...</p>
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
                Fear & Greed Index
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Market sentiment indicator for cryptocurrency markets
              </p>
            </div>
            
            <button
              onClick={() => fetchFearGreedData(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
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
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {data && (
          <div className="space-y-8">
            {/* Current Index Display */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              <div className="text-center">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                    Current Market Sentiment
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Based on market volatility, momentum, and social media sentiment
                  </p>
                </div>

                {/* Large Value Display */}
                <div className="mb-8">
                  <div className="relative inline-block">
                    <div className={`text-6xl font-bold ${getValueColor(data.value)} mb-2`}>
                      {data.value}
                    </div>
                    <div className="text-2xl text-slate-500 dark:text-slate-400">/ 100</div>
                  </div>
                  
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${getClassificationColor(data.classification)} bg-slate-100 dark:bg-slate-700`}>
                    {data.classification}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md mx-auto mb-6">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-1000 ${getValueBgColor(data.value)}`}
                      style={{ width: `${data.value}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mt-2">
                    <span>0 (Extreme Fear)</span>
                    <span>100 (Extreme Greed)</span>
                  </div>
                </div>

                {/* Market Analysis */}
                <div className="text-center">
                  <p className="text-lg text-slate-700 dark:text-slate-300 mb-2">
                    {getMarketSentiment(data.value)}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    {getRecommendation(data.value)}
                  </p>
                </div>
              </div>
            </div>

            {/* Information Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* What is Fear & Greed Index */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    What is this?
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  The Fear & Greed Index measures market sentiment on a scale of 0-100. 
                  It combines multiple factors including volatility, momentum, and social media 
                  sentiment to gauge whether the market is driven by fear or greed.
                </p>
              </div>

              {/* How to Interpret */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    How to Interpret
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span className="text-red-600 dark:text-red-400">0-25:</span>
                    <span>Extreme Fear</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-600 dark:text-orange-400">26-45:</span>
                    <span>Fear</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600 dark:text-yellow-400">46-55:</span>
                    <span>Neutral</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600 dark:text-green-400">56-75:</span>
                    <span>Greed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-600 dark:text-emerald-400">76-100:</span>
                    <span>Extreme Greed</span>
                  </div>
                </div>
              </div>

              {/* Update Info */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Update Schedule
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                  The index is updated daily and reflects the current market sentiment.
                </p>
                {data.timeUntilUpdate && (
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Next update: {data.timeUntilUpdate}
                  </p>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    Investment Disclaimer
                  </h4>
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    The Fear & Greed Index is for informational purposes only and should not be used as the sole basis for investment decisions. 
                    Always conduct your own research and consider consulting with a financial advisor before making investment decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}
