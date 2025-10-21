'use client'

import { useEffect, useRef, useState } from 'react'

interface TradingViewWidgetProps {
  symbol?: string
  theme?: 'light' | 'dark'
  autosize?: boolean
  height?: number
  width?: number
  interval?: '1' | '3' | '5' | '15' | '30' | '60' | '120' | '180' | '240' | 'D' | 'W'
  timezone?: string
  style?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  locale?: string
  toolbar_bg?: string
  enable_publishing?: boolean
  hide_top_toolbar?: boolean
  hide_legend?: boolean
  save_image?: boolean
  hide_volume?: boolean
  studies?: string[]
  container_id?: string
  className?: string
}

export default function TradingViewWidget({
  symbol = 'BINANCE:BTCUSDT',
  theme = 'light',
  autosize = true,
  height = 400,
  width,
  interval = 'D',
  timezone = 'Etc/UTC',
  style = '1',
  locale = 'en',
  toolbar_bg = '#f1f3f6',
  enable_publishing = false,
  hide_top_toolbar = false,
  hide_legend = false,
  save_image = false,
  hide_volume = false,
  studies = [],
  container_id,
  className = ''
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const widgetRef = useRef<any>(null)

  // Generate unique container ID if not provided
  const uniqueContainerId = container_id || `tradingview_${Math.random().toString(36).substr(2, 9)}`

  useEffect(() => {
    const loadTradingViewScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if TradingView is already loaded
        if (window.TradingView) {
          resolve()
          return
        }

        // Check if script is already being loaded
        if (document.querySelector('script[src*="tradingview.com"]')) {
          // Wait for existing script to load
          const checkLoaded = () => {
            if (window.TradingView) {
              resolve()
            } else {
              setTimeout(checkLoaded, 100)
            }
          }
          checkLoaded()
          return
        }

        // Create and load the script
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = 'https://s3.tradingview.com/tv.js'
        script.async = true
        
        script.onload = () => {
          if (window.TradingView) {
            resolve()
          } else {
            reject(new Error('TradingView library failed to load'))
          }
        }
        
        script.onerror = () => {
          reject(new Error('Failed to load TradingView script'))
        }
        
        document.head.appendChild(script)
      })
    }

    const initializeWidget = async () => {
      try {
        setError(null)
        await loadTradingViewScript()
        
        if (!window.TradingView) {
          throw new Error('TradingView library not available')
        }

        // Clean up existing widget if it exists
        if (widgetRef.current) {
          widgetRef.current.remove()
        }

        // Create the widget
        const widget = new window.TradingView.widget({
          autosize,
          symbol,
          interval,
          timezone,
          theme: theme === 'dark' ? 'dark' : 'light',
          style: parseInt(style),
          locale,
          toolbar_bg,
          enable_publishing,
          hide_top_toolbar,
          hide_legend,
          save_image,
          hide_volume,
          studies,
          container_id: uniqueContainerId,
          width: width || '100%',
          height: height,
          ...(autosize ? {} : { width, height })
        })

        widgetRef.current = widget
        setIsLoaded(true)
        
      } catch (err) {
        console.error('TradingView widget error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load TradingView widget')
      }
    }

    // Only initialize if container is available
    if (containerRef.current) {
      initializeWidget()
    }

    // Cleanup function
    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove()
        } catch (err) {
          console.warn('Error removing TradingView widget:', err)
        }
      }
    }
  }, [symbol, theme, autosize, height, width, interval, timezone, style, locale, toolbar_bg, enable_publishing, hide_top_toolbar, hide_legend, save_image, hide_volume, studies, uniqueContainerId])

  // Handle theme changes
  useEffect(() => {
    if (isLoaded && widgetRef.current) {
      // TradingView widgets don't support dynamic theme changes
      // We need to recreate the widget with new theme
      const currentSymbol = symbol
      const currentInterval = interval
      
      // Small delay to ensure smooth transition
      setTimeout(() => {
        if (widgetRef.current) {
          widgetRef.current.remove()
        }
        
        if (window.TradingView) {
          const newWidget = new window.TradingView.widget({
            autosize,
            symbol: currentSymbol,
            interval: currentInterval,
            timezone,
            theme: theme === 'dark' ? 'dark' : 'light',
            style: parseInt(style),
            locale,
            toolbar_bg,
            enable_publishing,
            hide_top_toolbar,
            hide_legend,
            save_image,
            hide_volume,
            studies,
            container_id: uniqueContainerId,
            width: width || '100%',
            height: height,
            ...(autosize ? {} : { width, height })
          })
          
          widgetRef.current = newWidget
        }
      }, 100)
    }
  }, [theme])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg ${className}`} style={{ height, width }}>
        <div className="text-center p-6">
          <div className="text-red-500 mb-2">⚠️ Chart Error</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`tradingview-widget-container ${className}`} style={{ height, width }}>
      <div 
        ref={containerRef}
        id={uniqueContainerId}
        className="w-full h-full"
        style={{ 
          height: autosize ? '100%' : height,
          width: autosize ? '100%' : width
        }}
      />
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Loading chart...</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Extend Window interface for TradingView
declare global {
  interface Window {
    TradingView: any
  }
}
