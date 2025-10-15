'use client'

import { useState, useEffect } from 'react'
import { CryptoPrice } from '@/lib/crypto-api'

interface HeaderTickerProps {
  prices: CryptoPrice[]
}

export default function HeaderTicker({ prices }: HeaderTickerProps) {
  // Ensure prices is an array
  const pricesArray = Array.isArray(prices) ? prices : []
  
  // Debug logging
  useEffect(() => {
    console.log('HeaderTicker received prices:', prices)
    console.log('Prices array:', pricesArray)
    if (pricesArray.length > 0) {
      console.log('First price object:', pricesArray[0])
    }
  }, [prices, pricesArray])

  if (pricesArray.length === 0) {
    return (
      <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-slate-500 dark:text-slate-400 text-sm">
              Loading crypto prices...
            </div>
          </div>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    // Handle undefined, null, or invalid price values
    if (price === undefined || price === null || isNaN(price)) {
      return '$0.00'
    }
    
    if (price < 0.01) {
      return `$${price.toFixed(6)}`
    } else if (price < 1) {
      return `$${price.toFixed(4)}`
    } else if (price < 100) {
      return `$${price.toFixed(2)}`
    } else {
      return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    }
  }

  const formatChange = (change: number) => {
    // Handle undefined, null, or invalid change values
    if (change === undefined || change === null || isNaN(change)) {
      return '+0.00%'
    }
    
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  // Create a duplicated array for seamless scrolling
  const duplicatedPrices = [...pricesArray, ...pricesArray]

  return (
    <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="py-2">
        <div className="flex items-center space-x-8 animate-scroll">
          {duplicatedPrices.map((price, index) => {
            // Skip if price object is invalid or missing required properties
            if (!price || !price.symbol) {
              return null
            }
            
            return (
              <div
                key={`${price.symbol}-${index}`}
                className="flex items-center space-x-2 whitespace-nowrap"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {price.symbol || 'N/A'}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {formatPrice(price.current_price)}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      (price.price_change_percentage_24h || 0) >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatChange(price.price_change_percentage_24h)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
