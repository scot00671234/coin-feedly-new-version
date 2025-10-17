'use client'

import { useMemo, useState } from 'react'

interface SimpleChartProps {
  data: Array<{ time: number; value: number }>
  height?: number
  width?: number
  loading?: boolean
}

export default function SimpleChart({ data, height = 400, width, loading = false }: SimpleChartProps) {
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

    // Add padding for better visual spacing - optimized for better fit
    const padding = { top: 20, right: 40, bottom: 30, left: 50 }
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
      minValue,
      maxValue,
      minTime,
      maxTime,
      chartWidth,
      chartHeight,
      padding
    }
  }, [data, height, width])

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg"
        style={{ height: `${height}px`, width: width ? `${width}px` : '100%' }}
      >
        <div className="text-center">
          <div className="relative">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-600 border-t-blue-500"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-300 animate-pulse"></div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 font-medium">Loading chart...</p>
        </div>
      </div>
    )
  }

  if (!chartData) {
    return (
      <div 
        className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg"
        style={{ height: `${height}px`, width: width ? `${width}px` : '100%' }}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No data available</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Try selecting a different timeframe</p>
        </div>
      </div>
    )
  }

  const { points, pathData, areaPath, minValue, maxValue, chartWidth, chartHeight, padding } = chartData

  // Calculate price change
  const firstPrice = points[0]?.value || 0
  const lastPrice = points[points.length - 1]?.value || 0
  const priceChange = lastPrice - firstPrice
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0
  const isPositive = priceChange >= 0

  return (
    <div 
      className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden"
      style={{ 
        height: `${height}px`, 
        width: width ? `${width}px` : '100%',
        minHeight: '200px',
        minWidth: '300px'
      }}
    >
      {/* Header with price info */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              ${lastPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
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
          {/* Gradient definitions */}
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
          
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.5"/>
          </pattern>

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
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
        
        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#areaGradient)"
          className="animate-pulse"
        />
        
        {/* Price line with glow */}
        <path
          d={pathData}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          className="drop-shadow-lg"
        />
        
        {/* Data points with hover effects */}
        {points.map((point, index) => (
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
              r={hoveredPoint === index ? "6" : "4"}
              fill={hoveredPoint === index ? "#ffffff" : "#3b82f6"}
              stroke={hoveredPoint === index ? "#3b82f6" : "#ffffff"}
              strokeWidth={hoveredPoint === index ? "3" : "2"}
              className="transition-all duration-200 drop-shadow-md"
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

        {/* Hover tooltip */}
        {hoveredPoint !== null && (
          <g>
            <rect
              x={points[hoveredPoint].x - 40}
              y={points[hoveredPoint].y - 50}
              width="80"
              height="30"
              fill="rgba(0, 0, 0, 0.8)"
              rx="6"
              className="drop-shadow-lg"
            />
            <text
              x={points[hoveredPoint].x}
              y={points[hoveredPoint].y - 35}
              textAnchor="middle"
              className="text-xs fill-white font-medium"
            >
              ${points[hoveredPoint].value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </text>
            <text
              x={points[hoveredPoint].x}
              y={points[hoveredPoint].y - 20}
              textAnchor="middle"
              className="text-xs fill-slate-300"
            >
              {new Date(points[hoveredPoint].time * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </text>
          </g>
        )}
      </svg>

      {/* Chart type indicator */}
      <div className="absolute bottom-4 right-4">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Simple Chart</span>
        </div>
      </div>
    </div>
  )
}
