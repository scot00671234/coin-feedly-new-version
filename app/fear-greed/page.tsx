'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
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

  const fetchFearGreedData = async () => {
    try {
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
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Fear & Greed Index
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Real-time market sentiment indicator for cryptocurrency markets
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-12">
              <div className="text-center">
                <div className="animate-pulse">
                  <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mx-auto mb-4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Fear & Greed Index
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Real-time market sentiment indicator for cryptocurrency markets
          </p>
          {lastUpdated && (
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">
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
          <div className="max-w-4xl mx-auto">
            {/* Current Index Display */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-12 mb-16">
              <div className="text-center">
                {/* Large Value Display */}
                <div className="mb-12">
                  <div className="relative inline-block mb-6">
                    <div className={`text-8xl font-bold ${getValueColor(data.value)} mb-2`}>
                      {data.value}
                    </div>
                    <div className="text-3xl text-slate-400 dark:text-slate-500">/ 100</div>
                  </div>
                  
                  <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-xl font-semibold ${getClassificationColor(data.classification)} bg-slate-50 dark:bg-slate-700/50`}>
                    {data.classification}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-lg mx-auto mb-8">
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-4">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ${getValueBgColor(data.value)}`}
                      style={{ width: `${data.value}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Extreme Fear</span>
                    <span>Extreme Greed</span>
                  </div>
                </div>

                {/* Market Analysis */}
                <div className="text-center max-w-2xl mx-auto">
                  <p className="text-xl text-slate-700 dark:text-slate-300 mb-3 font-medium">
                    {getMarketSentiment(data.value)}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    {getRecommendation(data.value)}
                  </p>
                </div>
              </div>
            </div>

            {/* Information Cards */}
            <div className="grid gap-8 md:grid-cols-2">
              {/* What is Fear & Greed Index */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  About the Index
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  The Fear & Greed Index measures market sentiment on a scale of 0-100. 
                  It combines multiple factors including volatility, momentum, and social media 
                  sentiment to gauge whether the market is driven by fear or greed.
                </p>
              </div>

              {/* How to Interpret */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  Sentiment Ranges
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-red-600 dark:text-red-400 font-medium">0-25</span>
                    <span className="text-slate-600 dark:text-slate-400">Extreme Fear</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-orange-600 dark:text-orange-400 font-medium">26-45</span>
                    <span className="text-slate-600 dark:text-slate-400">Fear</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">46-55</span>
                    <span className="text-slate-600 dark:text-slate-400">Neutral</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-green-600 dark:text-green-400 font-medium">56-75</span>
                    <span className="text-slate-600 dark:text-slate-400">Greed</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">76-100</span>
                    <span className="text-slate-600 dark:text-slate-400">Extreme Greed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-16 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                The Fear & Greed Index is for informational purposes only and should not be used as the sole basis for investment decisions.
              </p>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}
