'use client'

import { useEffect, useState } from 'react'
import { CryptoPrice } from '@/types'
import { formatPrice, formatChange } from '@/lib/crypto-api'

interface CryptoPriceTickerProps {
  prices: CryptoPrice[]
}

export default function CryptoPriceTicker({ prices }: CryptoPriceTickerProps) {
  const [tickerPrices, setTickerPrices] = useState<CryptoPrice[]>([])

  useEffect(() => {
    if (prices.length > 0) {
      setTickerPrices(prices)
    }
  }, [prices])

  if (tickerPrices.length === 0) {
    return (
      <div className="bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700/50 rounded-lg p-4 mb-8">
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-slate-600 dark:text-slate-400">Loading crypto prices...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-200/40 dark:bg-slate-800/40 border border-slate-300/50 dark:border-slate-700/50 rounded-xl p-4 shadow-lg overflow-hidden">
      <div className="ticker-container">
        <div className="ticker-content">
          {tickerPrices.map((crypto) => (
            <div key={crypto.id} className="flex items-center space-x-2 ticker-item bg-slate-300/40 dark:bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-400/50 dark:border-slate-700/50 hover:bg-slate-400/40 dark:hover:bg-slate-700/40 transition-all duration-300 flex-shrink-0 mx-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
              <span className="font-bold text-slate-900 dark:text-white text-xs">{crypto.symbol}</span>
              <span className="text-slate-700 dark:text-slate-200 font-semibold text-xs">{formatPrice(crypto.price)}</span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                crypto.change24h > 0 ? 'text-emerald-300 bg-emerald-500/20' : 
                crypto.change24h < 0 ? 'text-red-300 bg-red-500/20' : 'text-slate-400 bg-slate-500/20'
              }`}>
                {formatChange(crypto.change24h)}
              </span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {tickerPrices.map((crypto) => (
            <div key={`duplicate-${crypto.id}`} className="flex items-center space-x-2 ticker-item bg-slate-300/40 dark:bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-400/50 dark:border-slate-700/50 hover:bg-slate-400/40 dark:hover:bg-slate-700/40 transition-all duration-300 flex-shrink-0 mx-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
              <span className="font-bold text-slate-900 dark:text-white text-xs">{crypto.symbol}</span>
              <span className="text-slate-700 dark:text-slate-200 font-semibold text-xs">{formatPrice(crypto.price)}</span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                crypto.change24h > 0 ? 'text-emerald-300 bg-emerald-500/20' : 
                crypto.change24h < 0 ? 'text-red-300 bg-red-500/20' : 'text-slate-400 bg-slate-500/20'
              }`}>
                {formatChange(crypto.change24h)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
