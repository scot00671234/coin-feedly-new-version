'use client'

import { useState, useEffect, useRef } from 'react'
import { CryptoPrice } from '@/lib/crypto-api'
import { priceManager } from '@/lib/price-manager'
import { formatPrice, formatChange } from '@/lib/crypto-api'

export default function PersistentTicker() {
  const [prices, setPrices] = useState<CryptoPrice[]>([])
  const [loading, setLoading] = useState(true)
  const tickerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  // Fetch crypto prices using unified API
  const fetchPrices = async () => {
    try {
      // Use unified API for consistent pricing
      const response = await fetch('/api/unified-crypto?action=ticker', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPrices(data.tickerData)
        
        // Update price manager with fresh data
        priceManager.updatePrices(data.tickerData)
        
        console.log('Unified prices updated:', new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error('Error fetching unified crypto prices:', error)
      
      // Fallback to price manager data
      const cachedPrices = priceManager.getAllPrices().slice(0, 10)
      if (cachedPrices.length > 0) {
        setPrices(cachedPrices)
        console.log('Using cached prices as fallback')
      }
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchPrices()
  }, [])

  // Refresh prices every 30 seconds to avoid rate limits
  useEffect(() => {
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  // Update ticker content without restarting animation when prices change
  useEffect(() => {
    if (prices.length === 0 || !tickerRef.current) return

    const ticker = tickerRef.current
    const tickerContent = ticker.querySelector('.ticker-content') as HTMLElement
    
    if (!tickerContent) return

    // Force a reflow to ensure the new content is rendered
    tickerContent.offsetHeight
    
    // Update the content width for the animation
    const newContentWidth = tickerContent.scrollWidth / 3
    // The animation will pick up the new width in its next frame
  }, [prices])

  // Smooth continuous animation with seamless loop
  useEffect(() => {
    if (prices.length === 0 || !tickerRef.current) return

    const ticker = tickerRef.current
    const tickerContent = ticker.querySelector('.ticker-content') as HTMLElement
    
    if (!tickerContent) return

    let position = 0
    const speed = 0.5 // pixels per frame
    let contentWidth = tickerContent.scrollWidth / 3 // Since we have 3 copies, use one-third width

    const animate = () => {
      position -= speed
      
      // Recalculate content width in case it changed due to data updates
      const newContentWidth = tickerContent.scrollWidth / 3
      if (Math.abs(newContentWidth - contentWidth) > 10) {
        contentWidth = newContentWidth
      }
      
      // Reset position when we've scrolled past one complete set of items
      // This creates a seamless loop since we have triplicated content
      if (position <= -contentWidth) {
        position = 0
      }
      
      tickerContent.style.transform = `translateX(${position}px)`
      animationRef.current = requestAnimationFrame(animate)
    }

    // Only start animation if not already running
    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
    }
  }, [prices.length]) // Only restart when the number of items changes, not on every data update

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
        <div className="py-1.5 sm:py-2">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-slate-400 text-xs sm:text-sm">
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
      <div className="py-1.5 sm:py-2 overflow-hidden w-full" ref={tickerRef}>
        <div className="ticker-content flex items-center space-x-4 sm:space-x-8 w-full">
          {/* Duplicate the prices for seamless loop - we need at least 3 copies for truly seamless scrolling */}
          {Array.from({ length: 3 }, (_, duplicateIndex) => 
            sortedPrices.map((crypto, index) => (
              <div
                key={`${crypto.symbol}-${duplicateIndex}-${index}`}
                className="flex items-center space-x-2 sm:space-x-3 whitespace-nowrap flex-shrink-0"
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="font-bold text-white text-xs sm:text-sm">
                    {crypto.symbol}
                  </span>
                  <span className="text-slate-200 font-semibold text-xs sm:text-sm">
                    {formatPrice(crypto.current_price)}
                  </span>
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ${
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
