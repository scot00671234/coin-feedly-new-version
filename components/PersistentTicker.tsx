'use client'

import { useState, useEffect, useRef } from 'react'
import { CryptoPrice } from '@/lib/crypto-api'
import { formatPrice, formatChange } from '@/lib/crypto-api'

export default function PersistentTicker() {
  const [prices, setPrices] = useState<CryptoPrice[]>([])
  const [loading, setLoading] = useState(true)
  const tickerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  // Fetch crypto prices
  const fetchPrices = async () => {
    try {
      const response = await fetch('/api/crypto-prices')
      if (response.ok) {
        const data = await response.json()
        setPrices(data)
      }
    } catch (error) {
      console.error('Error fetching crypto prices:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchPrices()
  }, [])

  // Refresh prices every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  // Smooth continuous animation
  useEffect(() => {
    if (prices.length === 0 || !tickerRef.current) return

    const ticker = tickerRef.current
    const tickerContent = ticker.querySelector('.ticker-content') as HTMLElement
    
    if (!tickerContent) return

    let position = 0
    const speed = 0.5 // pixels per frame

    const animate = () => {
      position -= speed
      
      // Reset position when we've scrolled past the first set of items
      if (position <= -tickerContent.scrollWidth / 2) {
        position = 0
      }
      
      tickerContent.style.transform = `translateX(${position}px)`
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [prices])

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
        <div className="py-2">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-slate-400 text-sm">
              Loading crypto prices...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (prices.length === 0) {
    return null
  }

  // Sort prices by market cap order
  const sortedPrices = [...prices].sort((a, b) => {
    const order = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE', 'AVAX', 'DOT', 'LINK', 'LTC', 'BCH', 'XLM', 'XMR']
    const aIndex = order.indexOf(a.symbol)
    const bIndex = order.indexOf(b.symbol)
    
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    
    return a.symbol.localeCompare(b.symbol)
  })

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 sticky top-0 z-40 w-full max-w-full overflow-hidden">
      <div className="py-2 overflow-hidden w-full" ref={tickerRef}>
        <div className="ticker-content flex items-center space-x-8 w-full">
          {/* Duplicate the prices for seamless loop */}
          {Array.from({ length: 2 }, (_, duplicateIndex) => 
            sortedPrices.map((crypto, index) => (
              <div
                key={`${crypto.symbol}-${duplicateIndex}-${index}`}
                className="flex items-center space-x-3 whitespace-nowrap flex-shrink-0"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">
                    {crypto.symbol}
                  </span>
                  <span className="text-slate-200 font-semibold text-sm">
                    {formatPrice(crypto.current_price)}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      (crypto.price_change_percentage_24h || 0) >= 0
                        ? 'text-green-300 bg-green-900/30'
                        : 'text-red-300 bg-red-900/30'
                    }`}
                  >
                    {formatChange(crypto.price_change_percentage_24h)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
