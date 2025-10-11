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
      // Sort prices by market cap order (Bitcoin first, then by market cap)
      const sortedPrices = [...prices].sort((a, b) => {
        const order = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE', 'AVAX', 'DOT', 'LINK', 'LTC', 'BCH', 'XLM', 'XMR']
        const aIndex = order.indexOf(a.symbol)
        const bIndex = order.indexOf(b.symbol)
        
        // If both are in the predefined order, sort by that order
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex
        }
        
        // If only one is in the predefined order, prioritize it
        if (aIndex !== -1) return -1
        if (bIndex !== -1) return 1
        
        // If neither is in the predefined order, sort alphabetically
        return a.symbol.localeCompare(b.symbol)
      })
      
      setTickerPrices(sortedPrices)
    }
  }, [prices])

  if (tickerPrices.length === 0) {
    return (
      <div className="overflow-hidden">
        <div className="flex items-center justify-center py-4">
          <div className="animate-pulse text-slate-600 dark:text-slate-400">Loading crypto prices...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <div className="ticker-container">
        <div className="ticker-content">
          {tickerPrices.map((crypto) => (
            <div key={crypto.id} className="flex items-center space-x-3 ticker-item bg-slate-200/60 dark:bg-slate-800/60 px-4 py-2 rounded-lg hover:bg-slate-300/60 dark:hover:bg-slate-700/60 transition-all duration-300 flex-shrink-0 mx-1">
              <span className="font-bold text-slate-900 dark:text-white text-sm">{crypto.symbol}</span>
              <span className="text-slate-700 dark:text-slate-200 font-semibold text-sm">{formatPrice(crypto.price)}</span>
              <span className={`text-sm font-bold px-2 py-1 rounded ${
                crypto.change24h > 0 ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' : 
                crypto.change24h < 0 ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30' : 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800/50'
              }`}>
                {formatChange(crypto.change24h)}
              </span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {tickerPrices.map((crypto) => (
            <div key={`duplicate-${crypto.id}`} className="flex items-center space-x-3 ticker-item bg-slate-200/60 dark:bg-slate-800/60 px-4 py-2 rounded-lg hover:bg-slate-300/60 dark:hover:bg-slate-700/60 transition-all duration-300 flex-shrink-0 mx-1">
              <span className="font-bold text-slate-900 dark:text-white text-sm">{crypto.symbol}</span>
              <span className="text-slate-700 dark:text-slate-200 font-semibold text-sm">{formatPrice(crypto.price)}</span>
              <span className={`text-sm font-bold px-2 py-1 rounded ${
                crypto.change24h > 0 ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' : 
                crypto.change24h < 0 ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30' : 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800/50'
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
