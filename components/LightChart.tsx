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
  const [useSimpleChart, setUseSimpleChart] = useState(false)
  const [containerReady, setContainerReady] = useState(false)

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

  // Check if container is ready with timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let attempts = 0
    const maxAttempts = 50 // 5 seconds max

    const checkContainer = () => {
      attempts++
      if (chartContainerRef.current) {
        setContainerReady(true)
        console.log('Container is ready')
      } else if (attempts >= maxAttempts) {
        console.log('Container timeout, falling back to simple chart')
        setUseSimpleChart(true)
      } else {
        console.log('Container not ready yet, attempt', attempts)
        timeoutId = setTimeout(checkContainer, 100)
      }
    }
    checkContainer()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  // Initialize chart when container is ready
  useEffect(() => {
    if (!containerReady || isInitialized || useSimpleChart) {
      return
    }

    const initializeChart = async () => {
      try {
        console.log('Initializing chart...')
        
        if (!chartContainerRef.current) {
          console.log('Container ref is null, falling back to simple chart')
          setUseSimpleChart(true)
          return
        }

        const container = chartContainerRef.current
        
        // Set explicit dimensions
        container.style.width = width ? `${width}px` : '100%'
        container.style.height = `${height}px`
        container.style.minWidth = '300px'
        container.style.minHeight = '200px'

        // Wait for dimensions to be applied
        await new Promise(resolve => setTimeout(resolve, 100))

        const containerWidth = container.clientWidth || 400
        const containerHeight = container.clientHeight || height

        if (containerWidth < 100 || containerHeight < 100) {
          console.log('Container too small, falling back to simple chart')
          setUseSimpleChart(true)
          return
        }

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

        console.log('Chart initialization complete')

      } catch (error) {
        console.error('Error creating chart:', error)
        setChartError(error instanceof Error ? error.message : 'Unknown error')
        setUseSimpleChart(true)
      }
    }

    initializeChart()
    
    return cleanup
  }, [containerReady, isInitialized, useSimpleChart, height, width, cleanup])

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


  // If we should use simple chart or have no data, use SimpleChart with candlesticks
  if (useSimpleChart || data.length === 0 || loading) {
    return (
      <SimpleChart 
        data={data} 
        height={height} 
        width={width} 
        loading={loading}
        chartType="candlestick"
      />
    )
  }

  // Show initializing state
  if (!isInitialized || !containerReady) {
    return (
      <div 
        className="flex items-center justify-center bg-slate-100 dark:bg-slate-700/30 rounded-lg text-slate-500 dark:text-slate-400"
        style={{ height: `${height}px`, width: width ? `${width}px` : '100%' }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-sm">Initializing chart...</p>
        </div>
      </div>
    )
  }

  // Render advanced chart
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
