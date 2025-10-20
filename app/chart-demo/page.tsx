'use client'

import { useState, useEffect } from 'react'
import ModernTradingChart from '@/components/ModernTradingChart'

export default function ChartDemoPage() {
  const [chartData, setChartData] = useState<Array<{ time: number; value: number }>>([])
  const [loading, setLoading] = useState(true)
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('dark')
  const [selectedColor, setSelectedColor] = useState<'gradient' | 'blue' | 'purple' | 'green'>('gradient')
  const [showGrid, setShowGrid] = useState(true)
  const [showAnnotations, setShowAnnotations] = useState(true)

  // Generate sample data
  useEffect(() => {
    const generateSampleData = () => {
      const data = []
      const now = Date.now() / 1000
      const startTime = now - (7 * 24 * 60 * 60) // 7 days ago
      const basePrice = 50000
      
      for (let i = 0; i < 168; i++) { // 168 hours = 7 days
        const time = startTime + (i * 60 * 60) // Each point is 1 hour apart
        const volatility = 0.02
        const trend = Math.sin(i / 20) * 0.1
        const random = (Math.random() - 0.5) * volatility
        const price = basePrice * (1 + trend + random)
        
        data.push({
          time: time,
          value: Math.max(price, 1000) // Ensure price doesn't go below $1000
        })
      }
      
      return data
    }

    setLoading(true)
    setTimeout(() => {
      setChartData(generateSampleData())
      setLoading(false)
    }, 1000)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Modern Trading Chart
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Clean, professional, and modern chart component designed for traders. 
            Features gradient lines, spacious design, and subtle annotations.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Chart Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Theme
              </label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value as 'light' | 'dark')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            {/* Line Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Line Color
              </label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value as 'gradient' | 'blue' | 'purple' | 'green')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="gradient">Gradient</option>
                <option value="blue">Blue</option>
                <option value="purple">Purple</option>
                <option value="green">Green</option>
              </select>
            </div>

            {/* Show Grid */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showGrid"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showGrid" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Show Grid
              </label>
            </div>

            {/* Show Annotations */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showAnnotations"
                checked={showAnnotations}
                onChange={(e) => setShowAnnotations(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showAnnotations" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Show Annotations
              </label>
            </div>
          </div>
        </div>

        {/* Chart Examples */}
        <div className="space-y-8">
          {/* Main Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Main Chart (Large)</h3>
            <ModernTradingChart
              data={chartData}
              height={500}
              loading={loading}
              lineColor={selectedColor}
              theme={selectedTheme}
              showGrid={showGrid}
              showAnnotations={showAnnotations}
            />
          </div>

          {/* Medium Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Medium Chart</h3>
            <ModernTradingChart
              data={chartData}
              height={300}
              loading={loading}
              lineColor={selectedColor}
              theme={selectedTheme}
              showGrid={showGrid}
              showAnnotations={showAnnotations}
            />
          </div>

          {/* Small Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Small Chart</h3>
            <ModernTradingChart
              data={chartData}
              height={200}
              loading={loading}
              lineColor={selectedColor}
              theme={selectedTheme}
              showGrid={showGrid}
              showAnnotations={showAnnotations}
            />
          </div>

          {/* Side by Side Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Blue Theme</h3>
              <ModernTradingChart
                data={chartData}
                height={250}
                loading={loading}
                lineColor="blue"
                theme={selectedTheme}
                showGrid={showGrid}
                showAnnotations={showAnnotations}
              />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Green Theme</h3>
              <ModernTradingChart
                data={chartData}
                height={250}
                loading={loading}
                lineColor="green"
                theme={selectedTheme}
                showGrid={showGrid}
                showAnnotations={showAnnotations}
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Gradient Lines</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Beautiful gradient lines with smooth color transitions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Spacious Design</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Clean, uncluttered layout with plenty of white space</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Professional Look</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Designed specifically for trading applications</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
