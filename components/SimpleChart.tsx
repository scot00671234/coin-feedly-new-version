'use client'

import { useMemo } from 'react'

interface SimpleChartProps {
  data: Array<{ time: number; value: number }>
  height?: number
  width?: number
  loading?: boolean
}

export default function SimpleChart({ data, height = 400, width, loading = false }: SimpleChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null

    const validData = data.filter(item => 
      typeof item.time === 'number' && 
      typeof item.value === 'number' && 
      !isNaN(item.time) && 
      !isNaN(item.value) &&
      item.value > 0
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

    // Add some padding
    const padding = 20
    const chartWidth = (width || 400) - padding * 2
    const chartHeight = height - padding * 2

    const points = sortedData.map((point, index) => {
      const x = padding + ((point.time - minTime) / timeRange) * chartWidth
      const y = padding + ((maxValue - point.value) / valueRange) * chartHeight
      return { x, y, value: point.value, time: point.time }
    })

    // Create SVG path
    const pathData = points.map((point, index) => {
      const command = index === 0 ? 'M' : 'L'
      return `${command} ${point.x} ${point.y}`
    }).join(' ')

    return {
      points,
      pathData,
      minValue,
      maxValue,
      minTime,
      maxTime,
      chartWidth,
      chartHeight
    }
  }, [data, height, width])

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-slate-100 dark:bg-slate-700/30 rounded-lg"
        style={{ height: `${height}px`, width: width ? `${width}px` : '100%' }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading chart...</p>
        </div>
      </div>
    )
  }

  if (!chartData) {
    return (
      <div 
        className="flex items-center justify-center bg-slate-100 dark:bg-slate-700/30 rounded-lg text-slate-500 dark:text-slate-400"
        style={{ height: `${height}px`, width: width ? `${width}px` : '100%' }}
      >
        <div className="text-center">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">Try selecting a different timeframe</p>
        </div>
      </div>
    )
  }

  const { points, pathData, minValue, maxValue, chartWidth, chartHeight } = chartData

  return (
    <div 
      className="w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700/30"
      style={{ height: `${height}px`, width: width ? `${width}px` : '100%' }}
    >
      <svg
        width={width || '100%'}
        height={height}
        className="w-full h-full"
        viewBox={`0 0 ${width || 400} ${height}`}
      >
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Chart area */}
        <rect
          x="20"
          y="20"
          width={chartWidth}
          height={chartHeight}
          fill="transparent"
          stroke="#374151"
          strokeWidth="1"
        />
        
        {/* Price line */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="#3b82f6"
            className="hover:r-4 transition-all"
          />
        ))}
        
        {/* Y-axis labels */}
        <text
          x="10"
          y="25"
          textAnchor="end"
          className="text-xs fill-slate-500 dark:fill-slate-400"
        >
          ${maxValue.toLocaleString()}
        </text>
        <text
          x="10"
          y={height - 25}
          textAnchor="end"
          className="text-xs fill-slate-500 dark:fill-slate-400"
        >
          ${minValue.toLocaleString()}
        </text>
        
        {/* X-axis labels */}
        <text
          x="25"
          y={height - 5}
          textAnchor="start"
          className="text-xs fill-slate-500 dark:fill-slate-400"
        >
          {new Date(chartData.minTime * 1000).toLocaleDateString()}
        </text>
        <text
          x={width ? width - 25 : 375}
          y={height - 5}
          textAnchor="end"
          className="text-xs fill-slate-500 dark:fill-slate-400"
        >
          {new Date(chartData.maxTime * 1000).toLocaleDateString()}
        </text>
      </svg>
    </div>
  )
}
