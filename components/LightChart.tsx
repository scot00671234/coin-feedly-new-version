'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, LineStyle, LineSeriesOptions, LineData, LineSeriesPartialOptions } from 'lightweight-charts'
import SimpleChart from './SimpleChart'
import ModernTradingChart from './ModernTradingChart'
import ProfessionalTradingChart from './ProfessionalTradingChart'

interface LightChartProps {
  data: Array<{ time: number; value: number }>
  height?: number
  width?: number
  loading?: boolean
  onError?: () => void
}

export default function LightChart({ data, height = 400, width, loading = false, onError }: LightChartProps) {
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
    const maxAttempts = 10 // 1 second max

    const checkContainer = () => {
      attempts++
      if (chartContainerRef.current && chartContainerRef.current.clientWidth > 0) {
        setContainerReady(true)
        console.log('Container is ready with dimensions:', chartContainerRef.current.clientWidth, 'x', chartContainerRef.current.clientHeight)
      } else if (attempts >= maxAttempts) {
        console.log('Container timeout, falling back to simple chart')
        setUseSimpleChart(true)
      } else {
        timeoutId = setTimeout(checkContainer, 100)
      }
    }
    
    // Start checking immediately
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
        
        // Get current dimensions without setting them explicitly
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

        // Create line series (Lightweight Charts API)
        if (typeof (chart as any).addLineSeries !== 'function') {
          console.warn('addLineSeries is not available on chart instance, falling back to simple chart')
          setUseSimpleChart(true)
          return
        }

        const lineSeries = (chart as any).addLineSeries({
          color: '#3b82f6',
          lineWidth: 2,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        })
        console.log('Line series created successfully')

        chartRef.current = chart
        seriesRef.current = lineSeries
        setIsInitialized(true)
        setChartError(null)

        console.log('Chart initialization complete')

      } catch (error) {
        console.error('Error creating chart:', error)
        setChartError(error instanceof Error ? error.message : 'Unknown error')
        setUseSimpleChart(true)
        onError?.()
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


  // If we should use simple chart, have no data, or loading, use ModernTradingChart
  if (useSimpleChart || data.length === 0 || loading) {
    return (
      <ModernTradingChart 
        data={data} 
        height={height} 
        width={width} 
        loading={loading}
        lineColor="gradient"
        theme="dark"
        showGrid={true}
        showAnnotations={true}
      />
    )
  }

  // Always render the container so the ref can measure dimensions; overlay loading UI if needed
  return (
    <div 
      ref={chartContainerRef}
      className="w-full rounded-lg overflow-hidden relative"
      style={{ 
        height: `${height}px`, 
        width: width ? `${width}px` : '100%',
        minHeight: '200px',
        minWidth: '300px'
      }}
    >
      {(!isInitialized || !containerReady) && !useSimpleChart && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-sm">Initializing chart...</p>
          </div>
        </div>
      )}
    </div>
  )
}
