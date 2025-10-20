'use client'

import { useMemo, useState } from 'react'

interface SimpleChartProps {
  data: Array<{ time: number; value: number }>
  height?: number
  width?: number
  loading?: boolean
  chartType?: 'line' | 'candlestick'
}

export default function SimpleChart({ data, height = 400, width, loading = false, chartType = 'line' }: SimpleChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  
  const chartData = useMemo(() => {
    if (data.length === 0) return null

    const validData = data.filter(item => 
      typeof item.time === 'number' && 
      typeof item.value === 'number' && 
      !isNaN(item.time) && 
      !isNaN(item.value) &&
      item.value > 0 &&
      item.time > 0 // Ensure time is positive
    )

    if (validData.length === 0) return null

    // Sort by time
    const sortedData = validData.sort((a, b) => a.time - b.time)
    
    const minTime = Math.min(...sortedData.map(d => d.time))
    const maxTime = Math.max(...sortedData.map(d => d.time))
    const minValue = Math.min(...sortedData.map(d => d.value))
    const maxValue = Math.max(...sortedData.map(d => d.value))

    const timeRange = maxTime - minTime
    const valueRange = maxValue - minValue
    
    // Handle edge cases for better accuracy
    if (timeRange === 0 || valueRange === 0) {
      console.warn('Invalid data range for chart')
      return null
    }

    // Add padding for better visual spacing - optimized for rectangular containers
    const padding = { top: 30, right: 50, bottom: 40, left: 60 }
    const chartWidth = (width || 400) - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    const points = sortedData.map((point, index) => {
      // More precise calculations for better accuracy
      const x = padding.left + ((point.time - minTime) / timeRange) * chartWidth
      const y = padding.top + ((maxValue - point.value) / valueRange) * chartHeight
      return { 
        x: Math.round(x * 100) / 100, // Round to 2 decimal places for precision
        y: Math.round(y * 100) / 100, // Round to 2 decimal places for precision
        value: point.value, 
        time: point.time,
        index,
        isFirst: index === 0,
        isLast: index === sortedData.length - 1
      }
    })

    // Generate candlestick data for fallback
    const candlesticks = chartType === 'candlestick' ? generateCandlesticks(sortedData, minTime, maxTime, minValue, maxValue, chartWidth, chartHeight, padding) : []

    // Create smooth SVG path with curves
    const pathData = points.map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`
      
      const prevPoint = points[index - 1]
      const cp1x = prevPoint.x + (point.x - prevPoint.x) / 3
      const cp1y = prevPoint.y
      const cp2x = prevPoint.x + (point.x - prevPoint.x) * 2 / 3
      const cp2y = point.y
      
      return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`
    }).join(' ')

    // Create area path for gradient fill - more accurate calculation
    const areaPath = `${pathData} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`

    return {
      points,
      pathData,
      areaPath,
      candlesticks,
      minValue,
      maxValue,
      minTime,
      maxTime,
      chartWidth,
      chartHeight,
      padding
    }
  }, [data, height, width, chartType])

  // Generate candlestick data from line data
  const generateCandlesticks = (data: Array<{ time: number; value: number }>, minTime: number, maxTime: number, minValue: number, maxValue: number, chartWidth: number, chartHeight: number, padding: any) => {
    if (data.length < 2) return []

    const candlesticks = []
    const timeStep = (maxTime - minTime) / Math.max(20, data.length / 4) // Create 20-50 candles
    
    for (let i = 0; i < data.length - 1; i += Math.max(1, Math.floor(data.length / 30))) {
      const current = data[i]
      const next = data[i + 1] || data[i]
      
      // Simulate OHLC data from line data
      const open = current.value
      const close = next.value
      const high = Math.max(open, close) * (1 + Math.random() * 0.02) // Add some volatility
      const low = Math.min(open, close) * (1 - Math.random() * 0.02)
      
      const x = padding.left + ((current.time - minTime) / (maxTime - minTime)) * chartWidth
      const candleWidth = Math.max(2, chartWidth / 30)
      
      const openY = padding.top + ((maxValue - open) / (maxValue - minValue)) * chartHeight
      const closeY = padding.top + ((maxValue - close) / (maxValue - minValue)) * chartHeight
      const highY = padding.top + ((maxValue - high) / (maxValue - minValue)) * chartHeight
      const lowY = padding.top + ((maxValue - low) / (maxValue - minValue)) * chartHeight
      
      candlesticks.push({
        x: x - candleWidth / 2,
        y: Math.min(openY, closeY),
        width: candleWidth,
        height: Math.abs(closeY - openY) || 1,
        open,
        close,
        high,
        low,
        highY,
        lowY,
        isGreen: close >= open,
        time: current.time
      })
    }
    
    return candlesticks
  }

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl backdrop-blur-sm"
        style={{ 
          height: `${height}px`, 
          width: width ? `${width}px` : '100%',
          aspectRatio: width ? `${width}/${height}` : '16/9'
        }}
      >
        <div className="text-center">
          <div className="relative">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-600 border-t-blue-500 shadow-lg"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-300 animate-pulse"></div>
          </div>
          <p className="text-lg text-slate-700 dark:text-slate-300 mt-6 font-semibold">Loading chart...</p>
        </div>
      </div>
    )
  }

  if (!chartData) {
    return (
      <div 
        className="flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl backdrop-blur-sm"
        style={{ 
          height: `${height}px`, 
          width: width ? `${width}px` : '100%',
          aspectRatio: width ? `${width}/${height}` : '16/9'
        }}
      >
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">No data available</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Try selecting a different timeframe</p>
        </div>
      </div>
    )
  }

  const { points, pathData, areaPath, candlesticks, minValue, maxValue, chartWidth, chartHeight, padding } = chartData

  // Calculate price change
  const firstPrice = points[0]?.value || 0
  const lastPrice = points[points.length - 1]?.value || 0
  const priceChange = lastPrice - firstPrice
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0
  const isPositive = priceChange >= 0

  return (
    <div 
      className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl overflow-hidden backdrop-blur-sm"
      style={{ 
        height: `${height}px`, 
        width: width ? `${width}px` : '100%',
        minHeight: '200px',
        minWidth: '300px',
        aspectRatio: width ? `${width}/${height}` : '16/9' // Better aspect ratio for rectangular containers
      }}
    >
      {/* Header with price info - enhanced styling */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl border border-white/20 dark:border-slate-700/30">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'} shadow-lg`}></div>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
              ${lastPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
            <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${isPositive ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30' : 'text-red-700 bg-red-100 dark:bg-red-900/30'}`}>
              {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <svg
        width="100%"
        height="100%"
        className="w-full h-full"
        viewBox={`0 0 ${width || 400} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Enhanced gradient definitions */}
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
          </linearGradient>
          
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="30%" stopColor="#8b5cf6" />
            <stop offset="70%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          {/* Enhanced grid pattern */}
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="0.3" opacity="0.4"/>
          </pattern>

          {/* Enhanced glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Subtle shadow filter */}
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.1"/>
          </filter>
        </defs>

        {/* Background */}
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Chart area background */}
        <rect
          x={padding.left}
          y={padding.top}
          width={chartWidth}
          height={chartHeight}
          fill="transparent"
          rx="4"
        />
        
        {/* Area fill - only for line charts */}
        {chartType === 'line' && (
          <path
            d={areaPath}
            fill="url(#areaGradient)"
            className="animate-pulse"
          />
        )}
        
        {/* Price line with enhanced styling - only for line charts */}
        {chartType === 'line' && (
          <path
            d={pathData}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            className="drop-shadow-xl"
          />
        )}

        {/* Candlestick rendering */}
        {chartType === 'candlestick' && candlesticks.map((candle, index) => (
          <g key={index}>
            {/* High-Low line */}
            <line
              x1={candle.x + candle.width / 2}
              y1={candle.highY}
              x2={candle.x + candle.width / 2}
              y2={candle.lowY}
              stroke={candle.isGreen ? '#10b981' : '#ef4444'}
              strokeWidth="1"
              className="drop-shadow-sm"
            />
            
            {/* Candle body */}
            <rect
              x={candle.x}
              y={candle.y}
              width={candle.width}
              height={candle.height}
              fill={candle.isGreen ? '#10b981' : '#ef4444'}
              stroke={candle.isGreen ? '#059669' : '#dc2626'}
              strokeWidth="0.5"
              rx="1"
              className="drop-shadow-sm"
              onMouseEnter={() => setHoveredPoint(index)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}
        
        {/* Data points with hover effects - only for line charts */}
        {chartType === 'line' && points.map((point, index) => (
          <g key={index}>
            {/* Hover area (invisible but larger) */}
            <circle
              cx={point.x}
              cy={point.y}
              r="8"
              fill="transparent"
              onMouseEnter={() => setHoveredPoint(index)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer"
            />
            
            {/* Actual point */}
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredPoint === index ? "8" : "5"}
              fill={hoveredPoint === index ? "#ffffff" : "#3b82f6"}
              stroke={hoveredPoint === index ? "#3b82f6" : "#ffffff"}
              strokeWidth={hoveredPoint === index ? "4" : "3"}
              className="transition-all duration-300 drop-shadow-lg"
              filter="url(#shadow)"
            />
            
          </g>
        ))}
        
        {/* Y-axis labels with better styling */}
        <text
          x={padding.left - 10}
          y={padding.top + 5}
          textAnchor="end"
          className="text-xs fill-slate-500 dark:fill-slate-400 font-medium"
        >
          ${maxValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </text>
        <text
          x={padding.left - 10}
          y={padding.top + chartHeight + 5}
          textAnchor="end"
          className="text-xs fill-slate-500 dark:fill-slate-400 font-medium"
        >
          ${minValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </text>
        
        {/* X-axis labels with better styling */}
        <text
          x={padding.left}
          y={height - 10}
          textAnchor="start"
          className="text-xs fill-slate-500 dark:fill-slate-400 font-medium"
        >
          {new Date(chartData.minTime * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </text>
        <text
          x={width ? width - padding.right : 400 - padding.right}
          y={height - 10}
          textAnchor="end"
          className="text-xs fill-slate-500 dark:fill-slate-400 font-medium"
        >
          {new Date(chartData.maxTime * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </text>

        {/* Enhanced hover tooltip */}
        {hoveredPoint !== null && (
          <g>
            <rect
              x={(chartType === 'candlestick' ? candlesticks[hoveredPoint]?.x + candlesticks[hoveredPoint]?.width / 2 : points[hoveredPoint]?.x) - 50}
              y={(chartType === 'candlestick' ? candlesticks[hoveredPoint]?.y : points[hoveredPoint]?.y) - 60}
              width="100"
              height={chartType === 'candlestick' ? "60" : "40"}
              fill="rgba(15, 23, 42, 0.95)"
              rx="12"
              className="drop-shadow-2xl"
              filter="url(#shadow)"
            />
            <text
              x={chartType === 'candlestick' ? candlesticks[hoveredPoint]?.x + candlesticks[hoveredPoint]?.width / 2 : points[hoveredPoint]?.x}
              y={(chartType === 'candlestick' ? candlesticks[hoveredPoint]?.y : points[hoveredPoint]?.y) - 40}
              textAnchor="middle"
              className="text-sm fill-white font-bold"
            >
              {chartType === 'candlestick' 
                ? `$${candlesticks[hoveredPoint]?.close.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
                : `$${points[hoveredPoint]?.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
              }
            </text>
            {chartType === 'candlestick' && (
              <text
                x={candlesticks[hoveredPoint]?.x + candlesticks[hoveredPoint]?.width / 2}
                y={candlesticks[hoveredPoint]?.y - 25}
                textAnchor="middle"
                className="text-xs fill-slate-300 font-medium"
              >
                O: ${candlesticks[hoveredPoint]?.open.toLocaleString('en-US', { maximumFractionDigits: 2 })} | H: ${candlesticks[hoveredPoint]?.high.toLocaleString('en-US', { maximumFractionDigits: 2 })} | L: ${candlesticks[hoveredPoint]?.low.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </text>
            )}
            <text
              x={chartType === 'candlestick' ? candlesticks[hoveredPoint]?.x + candlesticks[hoveredPoint]?.width / 2 : points[hoveredPoint]?.x}
              y={(chartType === 'candlestick' ? candlesticks[hoveredPoint]?.y : points[hoveredPoint]?.y) - (chartType === 'candlestick' ? 10 : 25)}
              textAnchor="middle"
              className="text-xs fill-slate-300 font-medium"
            >
              {new Date((chartType === 'candlestick' ? candlesticks[hoveredPoint]?.time : points[hoveredPoint]?.time) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </text>
          </g>
        )}
      </svg>

    </div>
  )
}
