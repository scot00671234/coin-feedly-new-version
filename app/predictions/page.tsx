'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, BarChart3, Brain, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ProfessionalTradingChart from '@/components/ProfessionalTradingChart'
import { priceManager } from '@/lib/price-manager'

export default function PredictionsPage() {
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null)
  const [bitcoinData, setBitcoinData] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Available cryptocurrencies for prediction (starting with Bitcoin)
  const availableCryptos = [
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
    }
  ]

  useEffect(() => {
    // Load Bitcoin data by default
    if (!selectedCrypto) {
      setSelectedCrypto('bitcoin')
      loadCryptoData('bitcoin')
    }
  }, [])

  const loadCryptoData = async (cryptoId: string) => {
    setLoading(true)
    try {
      // Get current price data
      const response = await fetch(`/api/smart-crypto?action=detail&id=${cryptoId}`)
      if (response.ok) {
        const data = await response.json()
        setBitcoinData(data.cryptoDetail)
        
        // Update price manager
        priceManager.updatePrices([data.cryptoDetail])
      }

      // Get chart data
      const chartResponse = await fetch(`/api/smart-crypto?action=chart&id=${cryptoId}&timeframe=30d`)
      if (chartResponse.ok) {
        const chartData = await chartResponse.json()
        const formattedData = chartData.chartData.map((item: any) => ({
          time: Math.floor(item.timestamp / 1000),
          value: parseFloat(item.price)
        }))
        setChartData(formattedData)
      }
    } catch (error) {
      console.error('Error loading crypto data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCryptoSelect = (cryptoId: string) => {
    setSelectedCrypto(cryptoId)
    loadCryptoData(cryptoId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/"
              className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Predictions</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Advanced AI-powered cryptocurrency price predictions and market analysis
          </p>
        </div>

        {/* Development Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                This page is currently under development
              </h3>
              <p className="text-amber-700 dark:text-amber-300">
                We're working on implementing advanced AI prediction models. Currently, you can view Bitcoin's historical data and basic chart analysis. 
                Full prediction features will be available soon.
              </p>
            </div>
          </div>
        </div>

        {/* Crypto Selection */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Select Cryptocurrency</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableCryptos.map((crypto) => (
              <button
                key={crypto.id}
                onClick={() => handleCryptoSelect(crypto.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedCrypto === crypto.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={crypto.image}
                    alt={crypto.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-left">
                    <div className="font-medium text-slate-900 dark:text-white">{crypto.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{crypto.symbol}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chart Section */}
        {selectedCrypto && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {bitcoinData?.name || 'Loading...'} Price Chart
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Historical data and trend analysis
                  </p>
                </div>
              </div>
              
              {bitcoinData && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${bitcoinData.current_price?.toLocaleString('en-US', { maximumFractionDigits: 2 }) || 'N/A'}
                  </div>
                  <div className={`text-sm font-medium ${
                    (bitcoinData.price_change_percentage_24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(bitcoinData.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                    {bitcoinData.price_change_percentage_24h?.toFixed(2) || '0.00'}%
                  </div>
                </div>
              )}
            </div>

            <ProfessionalTradingChart 
              data={chartData} 
              height={500} 
              loading={loading}
              lineColor="gradient"
              theme="dark"
              showGrid={true}
              showAnnotations={true}
              timeframe="30d"
              lastUpdated={priceManager.getLastUpdate()}
            />
          </div>
        )}

        {/* Coming Soon Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Predictions</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Machine learning models will analyze market patterns and provide price predictions for the next 24 hours, 7 days, and 30 days.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Trend Analysis</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Advanced technical analysis with support/resistance levels, moving averages, and momentum indicators.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Risk Assessment</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Comprehensive risk metrics including volatility analysis, correlation factors, and market sentiment indicators.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
