'use client'

import { useState, useEffect } from 'react'
import TradingViewWidget from './TradingViewWidget'
import { useTheme } from '@/contexts/ThemeContext'

interface TradingViewChartsProps {
  selectedCrypto?: string
  onCryptoSelect?: (crypto: string) => void
}

export default function TradingViewCharts({ selectedCrypto, onCryptoSelect }: TradingViewChartsProps) {
  const { isDarkMode } = useTheme()
  const [timeframe, setTimeframe] = useState<'1' | '3' | '5' | '15' | '30' | '60' | '120' | '180' | '240' | 'D' | 'W'>('D')
  const [chartStyle, setChartStyle] = useState<'0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'>('1')
  
  // Popular crypto symbols for TradingView
  const cryptoOptions = [
    { symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin (BTC/USDT)', id: 'bitcoin' },
    { symbol: 'BINANCE:ETHUSDT', name: 'Ethereum (ETH/USDT)', id: 'ethereum' },
    { symbol: 'BINANCE:BNBUSDT', name: 'BNB (BNB/USDT)', id: 'binancecoin' },
    { symbol: 'BINANCE:ADAUSDT', name: 'Cardano (ADA/USDT)', id: 'cardano' },
    { symbol: 'BINANCE:SOLUSDT', name: 'Solana (SOL/USDT)', id: 'solana' },
    { symbol: 'BINANCE:XRPUSDT', name: 'XRP (XRP/USDT)', id: 'ripple' },
    { symbol: 'BINANCE:DOTUSDT', name: 'Polkadot (DOT/USDT)', id: 'polkadot' },
    { symbol: 'BINANCE:DOGEUSDT', name: 'Dogecoin (DOGE/USDT)', id: 'dogecoin' },
    { symbol: 'BINANCE:AVAXUSDT', name: 'Avalanche (AVAX/USDT)', id: 'avalanche-2' },
    { symbol: 'BINANCE:MATICUSDT', name: 'Polygon (MATIC/USDT)', id: 'matic-network' }
  ]

  const currentCrypto = cryptoOptions.find(crypto => crypto.id === selectedCrypto) || cryptoOptions[0]

  const timeframeOptions = [
    { value: '1', label: '1m' },
    { value: '3', label: '3m' },
    { value: '5', label: '5m' },
    { value: '15', label: '15m' },
    { value: '30', label: '30m' },
    { value: '60', label: '1h' },
    { value: '120', label: '2h' },
    { value: '180', label: '3h' },
    { value: '240', label: '4h' },
    { value: 'D', label: '1D' },
    { value: 'W', label: '1W' }
  ]

  const styleOptions = [
    { value: '0', label: 'Bars' },
    { value: '1', label: 'Candles' },
    { value: '2', label: 'Hollow Candles' },
    { value: '3', label: 'Line' },
    { value: '4', label: 'Area' },
    { value: '5', label: 'Renko' },
    { value: '6', label: 'Line Break' },
    { value: '7', label: 'Kagi' },
    { value: '8', label: 'Point & Figure' },
    { value: '9', label: 'Heikin Ashi' }
  ]

  return (
    <div className="w-full space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Crypto Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Cryptocurrency
            </label>
            <select
              value={currentCrypto.id}
              onChange={(e) => onCryptoSelect?.(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {cryptoOptions.map((crypto) => (
                <option key={crypto.id} value={crypto.id}>
                  {crypto.name}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Timeframe
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timeframeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Chart Style */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Chart Style
            </label>
            <select
              value={chartStyle}
              onChange={(e) => setChartStyle(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {styleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TradingView Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {currentCrypto.name} - Professional Chart
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Real-time price data and technical analysis
          </p>
        </div>
        
        <div className="relative">
          <TradingViewWidget
            symbol={currentCrypto.symbol}
            theme={isDarkMode ? 'dark' : 'light'}
            autosize={true}
            height={600}
            interval={timeframe}
            style={chartStyle}
            enable_publishing={false}
            hide_top_toolbar={false}
            hide_legend={false}
            save_image={false}
            hide_volume={false}
            studies={['Volume@tv-basicstudies']}
            className="rounded-lg overflow-hidden"
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">i</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Professional Trading Charts
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              These charts are powered by TradingView and provide real-time data, technical indicators, 
              and professional trading tools. Use the controls above to customize your view.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
