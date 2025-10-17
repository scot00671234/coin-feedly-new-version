'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, LineStyle, LineSeriesOptions, LineData, LineSeriesPartialOptions } from 'lightweight-charts'
import SimpleChart from './SimpleChart'

interface LightChartProps {
  data: Array<{ time: number; value: number }>
  height?: number
  width?: number
  loading?: boolean
}

export default function LightChart({ data, height = 400, width, loading = false }: LightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [chartError, setChartError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 5

  // Cleanup function
  const cleanup = useCallback(() => {
    if (chartRef.current) {
      try {
        chartRef.current.remove()
      } catch (error) {
        console.warn('Error removing chart:', error)
      }
      chartRef.current = null
      seriesRef.current = null
    }
    setIsInitialized(false)
    setChartError(null)
  }, [])

  // Initialize chart with retry logic
  const initializeChart = useCallback(async () => {
    if (isInitialized || retryCount >= maxRetries) {
      return
    }

    console.log(`Chart initialization attempt ${retryCount + 1}/${maxRetries}`)
    
    // Clean up any existing chart
    cleanup()

    // Wait for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100))

    if (!chartContainerRef.current) {
      console.log('Chart container not ready, retrying...')
      setRetryCount(prev => prev + 1)
      setTimeout(initializeChart, 200)
      return
    }

    // Force container dimensions
    const container = chartContainerRef.current
    container.style.width = width ? `${width}px` : '100%'
    container.style.height = `${height}px`
    container.style.minWidth = '300px'
    container.style.minHeight = '200px'

    // Wait for dimensions to be applied
    await new Promise(resolve => setTimeout(resolve, 50))

    const containerWidth = container.clientWidth || 400
    const containerHeight = container.clientHeight || height

    if (containerWidth < 100 || containerHeight < 100) {
      console.log('Container dimensions too small, retrying...')
      setRetryCount(prev => prev + 1)
      setTimeout(initializeChart, 200)
      return
    }

    try {
      console.log('Creating chart with dimensions:', containerWidth, 'x', containerHeight)
      
      const chart = createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: '#374151' },
          horzLines: { color: '#374151' },
        },
        crosshair: {
          mode: 1,
        },
        rightPriceScale: {
          borderColor: '#374151',
          textColor: '#d1d5db',
        },
        timeScale: {
          borderColor: '#374151',
          timeVisible: true,
          secondsVisible: false,
        },
        width: containerWidth,
        height: containerHeight,
      })

      console.log('Chart created successfully')

      // Create line series
      let lineSeries
      try {
        lineSeries = chart.addSeries('Line' as any, {
          color: '#3b82f6',
          lineWidth: 2,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        } as LineSeriesPartialOptions)
        console.log('Line series created successfully')
      } catch (seriesError) {
        console.warn('Modern API failed, trying legacy method:', seriesError)
        lineSeries = (chart as any).addLineSeries({
          color: '#3b82f6',
          lineWidth: 2,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        })
        console.log('Line series created with legacy API')
      }

      chartRef.current = chart
      seriesRef.current = lineSeries
      setIsInitialized(true)
      setChartError(null)
      setRetryCount(0)

      console.log('Chart initialization complete')

    } catch (error) {
      console.error('Error creating chart:', error)
      setChartError(error instanceof Error ? error.message : 'Unknown error')
      setRetryCount(prev => prev + 1)
      
      if (retryCount < maxRetries - 1) {
        setTimeout(initializeChart, 500)
      }
    }
  }, [isInitialized, retryCount, maxRetries, height, width, cleanup])

  // Initialize chart on mount
  useEffect(() => {
    initializeChart()
    
    return cleanup
  }, [initializeChart, cleanup])

  // Handle data updates
  useEffect(() => {
    if (!isInitialized || !seriesRef.current || data.length === 0) {
      return
    }

    try {
      console.log('Setting chart data:', data.length, 'points')
      
      // Validate and process data
      const validData = data.filter(item => 
        typeof item.time === 'number' && 
        typeof item.value === 'number' && 
        !isNaN(item.time) && 
        !isNaN(item.value) &&
        item.value > 0
      )
      
      if (validData.length === 0) {
        console.warn('No valid data points found')
        return
      }
      
      const chartData = validData.map(item => ({
        time: Math.floor(item.time),
        value: item.value
      }))
      
      seriesRef.current.setData(chartData)
      
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent()
      }
      
      console.log('Chart data set successfully')
    } catch (error) {
      console.error('Error setting chart data:', error)
      setChartError('Failed to set chart data')
    }
  }, [data, isInitialized])


  // Show loading state
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

  // Show error state with fallback to SimpleChart
  if (chartError && retryCount >= maxRetries) {
    return (
      <div className="space-y-2">
        <div className="text-center text-sm text-yellow-600 dark:text-yellow-400">
          <p>Advanced chart failed, using simple chart</p>
        </div>
        <SimpleChart 
          data={data} 
          height={height} 
          width={width} 
          loading={loading}
        />
        <div className="text-center">
          <button 
            onClick={() => {
              setRetryCount(0)
              setChartError(null)
              initializeChart()
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
          >
            Try Advanced Chart
          </button>
        </div>
      </div>
    )
  }

  // Show no data state
  if (data.length === 0) {
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

  // Show initializing state
  if (!isInitialized) {
    return (
      <div 
        className="flex items-center justify-center bg-slate-100 dark:bg-slate-700/30 rounded-lg text-slate-500 dark:text-slate-400"
        style={{ height: `${height}px`, width: width ? `${width}px` : '100%' }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-sm">Initializing chart...</p>
          {retryCount > 0 && (
            <p className="text-xs mt-1">Attempt {retryCount + 1}/{maxRetries}</p>
          )}
        </div>
      </div>
    )
  }

  // Render chart
  return (
    <div 
      ref={chartContainerRef}
      className="w-full rounded-lg overflow-hidden"
      style={{ 
        height: `${height}px`, 
        width: width ? `${width}px` : '100%',
        minHeight: '200px',
        minWidth: '300px'
      }}
    />
  )
}
