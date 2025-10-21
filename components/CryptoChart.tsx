'use client'

import { useEffect, useState } from 'react'
import { CryptoPrice, cryptoAPI, formatPrice, formatMarketCap, formatVolume, formatPercentage } from '@/lib/crypto-api'
import { TrendingUp, TrendingDown, Star, ExternalLink, BarChart3 } from 'lucide-react'
import LightChart from './LightChart'
import ModernTradingChart from './ModernTradingChart'
import ProfessionalTradingChart from './ProfessionalTradingChart'

interface CryptoChartProps {
  crypto: CryptoPrice
}

export default function CryptoChart({ crypto }: CryptoChartProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'1d' | '7d' | '30d' | '90d'>('7d')
  const [useFallbackChart, setUseFallbackChart] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    fetchChartData()
  }, [crypto.id, timeframe])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      const days = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
      
      // Use backend API instead of direct CoinGecko API call
      const response = await fetch(`/api/crypto?action=chart&id=${crypto.id}&days=${days}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      const formattedData = data.map((item: any) => ({
        time: item.timestamp / 1000, // Convert to seconds (number)
        value: item.price
      }))
      
      setChartData(formattedData)
      setLastUpdated(new Date()) // Update timestamp when data is fetched
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
              (crypto.price_change_percentage_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {(crypto.price_change_percentage_24h || 0) >= 0 ? (
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


      {/* Chart */}
      <div className="p-4">
        <ProfessionalTradingChart 
          data={chartData} 
          height={400} 
          loading={loading}
          lineColor="gradient"
          theme="dark"
          showGrid={true}
          showAnnotations={true}
          timeframe={timeframe}
          lastUpdated={lastUpdated}
        />
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
              {(crypto.circulating_supply || 0).toLocaleString()} {crypto.symbol.toUpperCase()}
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
