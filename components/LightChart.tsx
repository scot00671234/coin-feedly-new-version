'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, LineStyle, LineSeriesOptions, LineData, LineSeriesPartialOptions } from 'lightweight-charts'

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

  useEffect(() => {
    console.log('Chart initialization useEffect triggered')
    console.log('Chart container ref:', !!chartContainerRef.current)
    console.log('Is initialized:', isInitialized)
    console.log('Height:', height, 'Width:', width)
    
    if (isInitialized) {
      console.log('Chart already initialized, skipping')
      return
    }

    // Reset initialization state if we're retrying
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
      seriesRef.current = null
    }

    // Use a timeout to ensure the DOM element is ready
    const initializeChart = () => {
      if (!chartContainerRef.current) {
        console.log('Chart container not ready, retrying...')
        setTimeout(initializeChart, 50)
        return
      }

      // Ensure the container has dimensions
      const containerWidth = chartContainerRef.current.clientWidth || 400
      const containerHeight = chartContainerRef.current.clientHeight || height
      
      if (containerWidth === 0 || containerHeight === 0) {
        console.log('Chart container has no dimensions, retrying...')
        setTimeout(initializeChart, 50)
        return
      }

      // Force minimum dimensions if needed
      if (containerWidth < 300) {
        chartContainerRef.current.style.width = '300px'
      }
      if (containerHeight < 200) {
        chartContainerRef.current.style.height = '200px'
      }

      try {
        console.log('Creating chart...')
        // Create chart
        const chart = createChart(chartContainerRef.current, {
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
          width: Math.max(width || containerWidth, 300),
          height: height,
        })

        console.log('Chart created successfully')
        console.log('Chart methods available:', Object.getOwnPropertyNames(chart))
        console.log('Chart prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(chart)))
        console.log('Chart addSeries method:', typeof chart.addSeries)

        // Create line series immediately after chart creation
        try {
          // Ensure chart container still exists and has dimensions
          if (!chartContainerRef.current || chartContainerRef.current.clientWidth === 0) {
            console.error('Chart container not ready for series creation')
            setIsInitialized(false)
            return
          }

          // Create line series using the correct API
          let lineSeries;
          try {
            // Try the modern API first
            lineSeries = chart.addSeries('Line' as any, {
              color: '#3b82f6',
              lineWidth: 2,
              priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
              },
            } as LineSeriesPartialOptions)
            console.log('Line series created successfully with modern API')
          } catch (error) {
            console.warn('Modern API failed, trying legacy method:', error)
            // Fallback to legacy method
            lineSeries = (chart as any).addLineSeries({
              color: '#3b82f6',
              lineWidth: 2,
              priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
              },
            })
            console.log('Line series created successfully with legacy API')
          }

          chartRef.current = chart
          seriesRef.current = lineSeries
          setIsInitialized(true)

          console.log('Chart initialization complete')
        } catch (seriesError) {
          console.error('Error creating series:', seriesError)
          setIsInitialized(false)
          // Clean up the chart if series creation fails
          if (chart) {
            chart.remove()
          }
        }

        // Handle resize
        const handleResize = () => {
          if (chartRef.current && chartContainerRef.current) {
            chartRef.current.applyOptions({
              width: width || chartContainerRef.current.clientWidth,
            })
          }
        }

        window.addEventListener('resize', handleResize)

        return () => {
          window.removeEventListener('resize', handleResize)
          if (chartRef.current) {
            chartRef.current.remove()
          }
        }
      } catch (error) {
        console.error('Error creating chart:', error)
        setIsInitialized(false)
      }
    }

    // Start initialization
    initializeChart()

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        seriesRef.current = null
        setIsInitialized(false)
      }
    }
  }, [height, width, isInitialized])

  useEffect(() => {
    console.log('LightChart data useEffect triggered with data:', data.length, 'points')
    console.log('Series ref exists:', !!seriesRef.current)
    console.log('Chart ref exists:', !!chartRef.current)
    console.log('Is initialized:', isInitialized)
    
    if (!isInitialized || !seriesRef.current) {
      console.log('Chart not initialized yet, waiting...')
      return
    }
    
    if (seriesRef.current && data.length > 0) {
      try {
        console.log('LightChart: Setting data with', data.length, 'points')
        console.log('Sample data:', data.slice(0, 3))
        
        // Validate data before processing
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
        
        // Convert data to the format expected by lightweight-charts
        const chartData = validData.map(item => ({
          time: Math.floor(item.time), // Ensure time is an integer (seconds since epoch)
          value: item.value
        }))
        
        console.log('Converted chart data:', chartData.slice(0, 3))
        seriesRef.current.setData(chartData)
        
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent()
        }
        console.log('Chart data set successfully')
      } catch (error) {
        console.error('Error setting chart data:', error)
      }
    } else {
      console.log('LightChart: Not setting data - seriesRef:', !!seriesRef.current, 'data length:', data.length, 'initialized:', isInitialized)
    }
  }, [data, isInitialized])


  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-slate-100 dark:bg-slate-700/30 rounded-lg"
        style={{ height, width: width || '100%' }}
      >
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-slate-100 dark:bg-slate-700/30 rounded-lg text-slate-500 dark:text-slate-400"
        style={{ height, width: width || '100%' }}
      >
        <div className="text-center">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">Try selecting a different timeframe</p>
        </div>
      </div>
    )
  }

  // Show error state if chart failed to initialize after data is available
  if (!isInitialized && data.length > 0) {
    return (
      <div 
        className="flex items-center justify-center bg-slate-100 dark:bg-slate-700/30 rounded-lg text-slate-500 dark:text-slate-400"
        style={{ height, width: width || '100%' }}
      >
        <div className="text-center">
          <p className="text-lg font-medium">Chart failed to load</p>
          <p className="text-sm">Please refresh the page</p>
        </div>
      </div>
    )
  }

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
