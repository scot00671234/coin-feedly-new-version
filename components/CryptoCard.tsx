'use client'

import { CryptoPrice, formatPrice, formatMarketCap, formatVolume, formatPercentage } from '@/lib/crypto-api'
import { TrendingUp, TrendingDown, Star } from 'lucide-react'

interface CryptoCardProps {
  crypto: CryptoPrice
  onClick?: (crypto: CryptoPrice) => void
  isSelected?: boolean
}

export default function CryptoCard({ crypto, onClick, isSelected = false }: CryptoCardProps) {
  return (
    <div
      onClick={() => onClick?.(crypto)}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-blue-600/20 border-blue-500/50'
          : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600/50'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">
            {formatPrice(crypto.current_price)}
          </span>
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

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-400 mb-1">Market Cap</div>
            <div className="text-white font-medium">{formatMarketCap(crypto.market_cap)}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">Volume (24h)</div>
            <div className="text-white font-medium">{formatVolume(crypto.total_volume)}</div>
          </div>
        </div>

        <div className="flex space-x-4 text-xs text-slate-400">
          <span>1h: {formatPercentage(crypto.price_change_percentage_1h_in_currency)}</span>
          <span>7d: {formatPercentage(crypto.price_change_percentage_7d_in_currency)}</span>
        </div>
      </div>
    </div>
  )
}


