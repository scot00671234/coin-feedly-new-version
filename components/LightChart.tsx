'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, LineStyle, LineSeriesOptions } from 'lightweight-charts'

interface LightChartProps {
  data: Array<{ time: number; value: number }>
  height?: number
  width?: number
  loading?: boolean
}

export default function LightChart({ data, height = 400, width, loading = false }: LightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    console.log('Chart initialization useEffect triggered')
    console.log('Chart container ref:', !!chartContainerRef.current)
    console.log('Is initialized:', isInitialized)
    console.log('Height:', height, 'Width:', width)
    
    if (!chartContainerRef.current || isInitialized) {
      console.log('Skipping chart initialization - container:', !!chartContainerRef.current, 'initialized:', isInitialized)
      return
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
        width: width || chartContainerRef.current.clientWidth,
        height: height,
      })

      console.log('Chart created successfully')

      // Create line series with proper typing and error handling
      const lineSeries = (chart as any).addLineSeries({
        color: '#3b82f6',
        lineWidth: 2,
      })

      console.log('Line series created successfully')

      chartRef.current = chart
      seriesRef.current = lineSeries
      setIsInitialized(true)

      console.log('Chart initialization complete')

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
  }, [height, width, isInitialized])

  useEffect(() => {
    console.log('LightChart useEffect triggered with data:', data.length, 'points')
    console.log('Series ref exists:', !!seriesRef.current)
    console.log('Chart ref exists:', !!chartRef.current)
    console.log('Is initialized:', isInitialized)
    
    if (seriesRef.current && data.length > 0) {
      try {
        console.log('LightChart: Setting data with', data.length, 'points')
        console.log('Sample data:', data.slice(0, 3))
        
        // Convert data to the format expected by lightweight-charts
        const chartData = data.map(item => ({
          time: item.time as any, // Cast to any to avoid type issues
          value: item.value
        }))
        
        console.log('Converted chart data:', chartData.slice(0, 3))
        seriesRef.current.setData(chartData as any)
        
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent()
        }
        console.log('Chart data set successfully')
      } catch (error) {
        console.error('Error setting chart data:', error)
      }
    } else {
      console.log('LightChart: Not setting data - seriesRef:', !!seriesRef.current, 'data length:', data.length)
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

  return (
    <div 
      ref={chartContainerRef}
      className="w-full rounded-lg overflow-hidden"
      style={{ height, width: width || '100%' }}
    />
  )
}
