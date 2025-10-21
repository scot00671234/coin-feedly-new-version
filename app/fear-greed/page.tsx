'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Clock, RefreshCw, BarChart3, Brain, Target } from 'lucide-react'
import Footer from '@/components/Footer'
import LiveNewsFeed from '@/components/LiveNewsFeed'

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Activity className="w-4 h-4 mr-2" />
              Market Sentiment
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Fear & Greed
              <span className="text-blue-600 dark:text-blue-400"> Index</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Professional market sentiment analysis for cryptocurrency markets
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-12">
              <div className="text-center">
                <div className="animate-pulse">
                  <div className="w-40 h-40 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-full mx-auto mb-8 shadow-lg"></div>
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 mx-auto mb-6"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <Activity className="w-4 h-4 mr-2" />
            Market Sentiment Analysis
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Fear & Greed
            <span className="text-blue-600 dark:text-blue-400"> Index</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Professional market sentiment analysis for cryptocurrency markets
          </p>
          {lastUpdated && (
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm">
              <Clock className="w-4 h-4 mr-2" />
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </div>
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
          <div className="max-w-6xl mx-auto">
            {/* Current Index Display */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-12 mb-16 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full transform scale-150 -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              <div className="text-center relative z-10">
                {/* Large Value Display */}
                <div className="mb-12">
                  <div className="relative inline-block mb-8">
                    <div className={`text-9xl font-black ${getValueColor(data.value)} mb-4 drop-shadow-lg`}>
                      {data.value}
                    </div>
                    <div className="text-4xl text-slate-400 dark:text-slate-500 font-light">/ 100</div>
                  </div>
                  
                  <div className={`inline-flex items-center gap-4 px-8 py-4 rounded-2xl text-2xl font-bold ${getClassificationColor(data.classification)} bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 shadow-lg border border-slate-200/50 dark:border-slate-700/50`}>
                    {data.value <= 50 ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                    {data.classification}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-2xl mx-auto mb-12">
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4 mb-6 shadow-inner">
                    <div
                      className={`h-4 rounded-full transition-all duration-2000 ease-out ${getValueBgColor(data.value)} shadow-lg`}
                      style={{ width: `${data.value}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Extreme Fear
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Extreme Greed
                    </span>
                  </div>
                </div>

                {/* Market Analysis */}
                <div className="text-center max-w-3xl mx-auto">
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/20 rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-2">
                      <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      Market Analysis
                    </h3>
                    <p className="text-xl text-slate-700 dark:text-slate-300 mb-4 font-medium">
                      {getMarketSentiment(data.value)}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {getRecommendation(data.value)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Cards */}
            <div className="grid gap-8 md:grid-cols-2 mb-16">
              {/* What is Fear & Greed Index */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  About the Index
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  The Fear & Greed Index measures market sentiment on a scale of 0-100. 
                  It combines multiple factors including volatility, momentum, and social media 
                  sentiment to gauge whether the market is driven by fear or greed.
                </p>
              </div>

              {/* How to Interpret */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Sentiment Ranges
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <span className="text-red-600 dark:text-red-400 font-medium">0-25</span>
                    <span className="text-slate-600 dark:text-slate-400">Extreme Fear</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                    <span className="text-orange-600 dark:text-orange-400 font-medium">26-45</span>
                    <span className="text-slate-600 dark:text-slate-400">Fear</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">46-55</span>
                    <span className="text-slate-600 dark:text-slate-400">Neutral</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <span className="text-green-600 dark:text-green-400 font-medium">56-75</span>
                    <span className="text-slate-600 dark:text-slate-400">Greed</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">76-100</span>
                    <span className="text-slate-600 dark:text-slate-400">Extreme Greed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live News Feed */}
            <LiveNewsFeed limit={6} />

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
