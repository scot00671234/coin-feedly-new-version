'use client'

import { useEffect, useState } from 'react'
import { CryptoPrice, cryptoAPI, formatPrice, formatMarketCap, formatVolume, formatPercentage } from '@/lib/crypto-api'
import { TrendingUp, TrendingDown, Star, ExternalLink, BarChart3 } from 'lucide-react'

interface CryptoChartProps {
  crypto: CryptoPrice
}

export default function CryptoChart({ crypto }: CryptoChartProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'1d' | '7d' | '30d' | '90d'>('7d')

  useEffect(() => {
    fetchChartData()
  }, [crypto.id, timeframe])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      const days = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
      const data = await cryptoAPI.getCryptoChartData(crypto.id, days)
      
      const formattedData = data.map(item => ({
        time: item.timestamp / 1000, // Convert to seconds
        value: item.price
      }))
      
      setChartData(formattedData)
    } catch (error) {
      console.error('Error fetching chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={crypto.image}
              alt={crypto.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="text-lg font-semibold text-white">{crypto.name}</h3>
              <p className="text-sm text-slate-400 uppercase">{crypto.symbol}</p>
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:text-yellow-400 transition-colors">
            <Star className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-white">
              {formatPrice(crypto.current_price)}
            </div>
            <div className={`flex items-center space-x-1 ${
              crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {crypto.price_change_percentage_24h >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {formatPercentage(crypto.price_change_percentage_24h)}
              </span>
            </div>
          </div>
          <a
            href={`https://www.coingecko.com/en/coins/${crypto.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex space-x-2">
          {(['1d', '7d', '30d', '90d'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <div className="w-full h-80 bg-slate-700/30 rounded-lg flex items-center justify-center">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Chart coming soon</p>
              <p className="text-sm">Data points: {chartData.length}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-400 mb-1">Market Cap</div>
            <div className="text-white font-medium">{formatMarketCap(crypto.market_cap)}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">Volume (24h)</div>
            <div className="text-white font-medium">{formatVolume(crypto.total_volume)}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">Circulating Supply</div>
            <div className="text-white font-medium">
              {crypto.circulating_supply.toLocaleString()} {crypto.symbol.toUpperCase()}
            </div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">Max Supply</div>
            <div className="text-white font-medium">
              {crypto.max_supply ? `${crypto.max_supply.toLocaleString()} ${crypto.symbol.toUpperCase()}` : '∞'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
