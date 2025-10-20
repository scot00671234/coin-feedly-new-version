'use client'

import { useMemo, useState, useRef, useEffect } from 'react'

interface ModernTradingChartProps {
  data: Array<{ time: number; value: number }>
  height?: number
  width?: number
  loading?: boolean
  showGrid?: boolean
  showAnnotations?: boolean
  lineColor?: 'gradient' | 'blue' | 'purple' | 'green'
  theme?: 'light' | 'dark'
}

export default function ModernTradingChart({ 
  data, 
  height = 400, 
  width, 
  loading = false, 
  showGrid = true,
  showAnnotations = true,
  lineColor = 'gradient',
  theme = 'light'
}: ModernTradingChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  
  const chartData = useMemo(() => {
    if (data.length === 0) return null

    const validData = data.filter(item => 
      typeof item.time === 'number' && 
      typeof item.value === 'number' && 
      !isNaN(item.time) && 
      !isNaN(item.value) &&
      item.value > 0 &&
      item.time > 0
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
    
    if (timeRange === 0 || valueRange === 0) {
      return null
    }

    // Spacious padding for clean look
    const padding = { top: 40, right: 60, bottom: 50, left: 80 }
    const chartWidth = (width || 400) - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    const points = sortedData.map((point, index) => {
      const x = padding.left + ((point.time - minTime) / timeRange) * chartWidth
      const y = padding.top + ((maxValue - point.value) / valueRange) * chartHeight
      return { 
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
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

    // Create area path for subtle fill
    const areaPath = `${pathData} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`

    // Calculate key levels for annotations
    const resistanceLevel = maxValue * 0.95
    const supportLevel = minValue * 1.05
    const midLevel = (maxValue + minValue) / 2

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
      padding,
      resistanceLevel,
      supportLevel,
      midLevel
    }
  }, [data, height, width])

  // Handle mouse movement for crosshair
  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !chartData) return
    
    const rect = svgRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    setMousePosition({ x, y })
  }

  const handleMouseLeave = () => {
    setMousePosition(null)
    setHoveredPoint(null)
  }

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
        style={{ 
          height: `${height}px`, 
          width: width ? `${width}px` : '100%',
        }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-600 border-t-blue-500"></div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 font-medium">Loading chart...</p>
        </div>
      </div>
    )
  }

  if (!chartData) {
    return (
      <div 
        className="flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
        style={{ 
          height: `${height}px`, 
          width: width ? `${width}px` : '100%',
        }}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">No data available</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Try selecting a different timeframe</p>
        </div>
      </div>
    )
  }

  const { points, pathData, areaPath, minValue, maxValue, chartWidth, chartHeight, padding, resistanceLevel, supportLevel, midLevel } = chartData

  // Calculate price change
  const firstPrice = points[0]?.value || 0
  const lastPrice = points[points.length - 1]?.value || 0
  const priceChange = lastPrice - firstPrice
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0
  const isPositive = priceChange >= 0

  // Color schemes
  const colors = {
    light: {
      background: '#ffffff',
      grid: '#f1f5f9',
      text: '#64748b',
      textDark: '#1e293b',
      border: '#e2e8f0'
    },
    dark: {
      background: '#0f172a',
      grid: '#1e293b',
      text: '#94a3b8',
      textDark: '#f1f5f9',
      border: '#334155'
    }
  }

  const currentTheme = colors[theme]

  return (
    <div 
      className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      style={{ 
        height: `${height}px`, 
        width: width ? `${width}px` : '100%',
        minHeight: '300px',
        minWidth: '400px',
      }}
    >
      {/* Price info overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              ${lastPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
            <span className={`text-sm font-semibold px-2 py-1 rounded ${isPositive ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300' : 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300'}`}>
              {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="w-full h-full"
        viewBox={`0 0 ${width || 400} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Gradient definitions based on line color */}
          {lineColor === 'gradient' && (
            <>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="30%" stopColor="#3b82f6" />
                <stop offset="70%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
              </linearGradient>
            </>
          )}
          
          {lineColor === 'blue' && (
            <>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
              </linearGradient>
            </>
          )}

          {lineColor === 'purple' && (
            <>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
              </linearGradient>
            </>
          )}

          {lineColor === 'green' && (
            <>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
              </linearGradient>
            </>
          )}

          {/* Subtle grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={currentTheme.grid} strokeWidth="0.5" opacity="0.3"/>
          </pattern>

          {/* Glow filter for the line */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="100%" height="100%" fill={currentTheme.background} />
        
        {/* Subtle grid */}
        {showGrid && (
          <rect
            x={padding.left}
            y={padding.top}
            width={chartWidth}
            height={chartHeight}
            fill="url(#grid)"
          />
        )}
        
        {/* Chart area background */}
        <rect
          x={padding.left}
          y={padding.top}
          width={chartWidth}
          height={chartHeight}
          fill="transparent"
        />
        
        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#areaGradient)"
        />
        
        {/* Main price line */}
        <path
          d={pathData}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />

        {/* Annotations */}
        {showAnnotations && (
          <>
            {/* Resistance level */}
            <line
              x1={padding.left}
              y1={padding.top + ((maxValue - resistanceLevel) / (maxValue - minValue)) * chartHeight}
              x2={padding.left + chartWidth}
              y2={padding.top + ((maxValue - resistanceLevel) / (maxValue - minValue)) * chartHeight}
              stroke={currentTheme.text}
              strokeWidth="1"
              strokeDasharray="5,5"
              opacity="0.6"
            />
            
            {/* Support level */}
            <line
              x1={padding.left}
              y1={padding.top + ((maxValue - supportLevel) / (maxValue - minValue)) * chartHeight}
              x2={padding.left + chartWidth}
              y2={padding.top + ((maxValue - supportLevel) / (maxValue - minValue)) * chartHeight}
              stroke={currentTheme.text}
              strokeWidth="1"
              strokeDasharray="3,3"
              opacity="0.6"
            />
          </>
        )}
        
        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            {/* Hover area */}
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="transparent"
              onMouseEnter={() => setHoveredPoint(index)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer"
            />
            
            {/* Point */}
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredPoint === index ? "4" : "2"}
              fill={hoveredPoint === index ? "#ffffff" : "url(#lineGradient)"}
              stroke={hoveredPoint === index ? "url(#lineGradient)" : "#ffffff"}
              strokeWidth={hoveredPoint === index ? "2" : "1"}
              className="transition-all duration-200"
            />
          </g>
        ))}

        {/* Crosshair */}
        {mousePosition && (
          <>
            <line
              x1={mousePosition.x}
              y1={padding.top}
              x2={mousePosition.x}
              y2={padding.top + chartHeight}
              stroke={currentTheme.text}
              strokeWidth="1"
              opacity="0.3"
            />
            <line
              x1={padding.left}
              y1={mousePosition.y}
              x2={padding.left + chartWidth}
              y2={mousePosition.y}
              stroke={currentTheme.text}
              strokeWidth="1"
              opacity="0.3"
            />
          </>
        )}
        
        {/* Y-axis labels */}
        <text
          x={padding.left - 10}
          y={padding.top + 5}
          textAnchor="end"
          className="text-xs font-medium"
          fill={currentTheme.text}
        >
          ${maxValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </text>
        <text
          x={padding.left - 10}
          y={padding.top + chartHeight + 5}
          textAnchor="end"
          className="text-xs font-medium"
          fill={currentTheme.text}
        >
          ${minValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </text>
        
        {/* X-axis labels */}
        <text
          x={padding.left}
          y={height - 15}
          textAnchor="start"
          className="text-xs font-medium"
          fill={currentTheme.text}
        >
          {new Date(chartData.minTime * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </text>
        <text
          x={width ? width - padding.right : 400 - padding.right}
          y={height - 15}
          textAnchor="end"
          className="text-xs font-medium"
          fill={currentTheme.text}
        >
          {new Date(chartData.maxTime * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </text>

        {/* Hover tooltip */}
        {hoveredPoint !== null && (
          <g>
            <rect
              x={points[hoveredPoint]?.x - 45}
              y={points[hoveredPoint]?.y - 50}
              width="90"
              height="35"
              fill="rgba(15, 23, 42, 0.95)"
              rx="8"
              className="drop-shadow-lg"
            />
            <text
              x={points[hoveredPoint]?.x}
              y={points[hoveredPoint]?.y - 30}
              textAnchor="middle"
              className="text-sm font-bold fill-white"
            >
              ${points[hoveredPoint]?.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </text>
            <text
              x={points[hoveredPoint]?.x}
              y={points[hoveredPoint]?.y - 15}
              textAnchor="middle"
              className="text-xs fill-slate-300"
            >
              {new Date(points[hoveredPoint]?.time * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
