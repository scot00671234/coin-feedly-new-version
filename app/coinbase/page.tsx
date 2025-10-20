'use client'

import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function CoinbasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link
              href="/"
              className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Coinbase</h1>
          <p className="text-slate-600 dark:text-slate-400">Platform where you can trade crypto</p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-lg">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">C</span>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Trade Cryptocurrency</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Buy, sell, and manage your cryptocurrency portfolio on one of the world's most trusted platforms.
            </p>
            
            <a
              href="https://coinbase.com/join/FFENEQM?src=referral-link"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Visit Coinbase</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            User is responsible for everything. This is not financial advice.
          </p>
        </div>
      </div>
    </div>
  )
}
