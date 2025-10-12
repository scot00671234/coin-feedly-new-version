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
    if (!chartContainerRef.current || isInitialized) return

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

    // Create line series
    const lineSeries = chart.addLineSeries({
      color: '#3b82f6',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
      crosshairMarkerBorderColor: '#3b82f6',
      crosshairMarkerBackgroundColor: '#3b82f6',
    })

    chartRef.current = chart
    seriesRef.current = lineSeries
    setIsInitialized(true)

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
  }, [height, width, isInitialized])

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data)
      
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent()
      }
    }
  }, [data])

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
