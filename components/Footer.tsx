'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-slate-900/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-800/50 dark:border-slate-800/50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Image 
                  src="/logo.svg" 
                  alt="Coin Feedly Logo" 
                  width={32} 
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white">Coin Feedly</span>
            </Link>
            <p className="text-slate-400 text-sm max-w-xs">
              Your trusted source for cryptocurrency news, market analysis, and real-time price updates.
            </p>
          </div>


          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">About</h3>
            <div className="space-y-2">
              <p className="text-slate-400 text-sm">
                Coin Feedly aggregates the latest cryptocurrency news from trusted sources, 
                providing real-time market data and comprehensive analysis.
              </p>
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Market Data</span>
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Resources</h3>
            <div className="space-y-2">
              <Link 
                href="/blog" 
                className="block text-slate-400 hover:text-white transition-colors text-sm"
              >
                Crypto News Blog
              </Link>
              <Link 
                href="/charts" 
                className="block text-slate-400 hover:text-white transition-colors text-sm"
              >
                Price Charts
              </Link>
              <Link 
                href="/api/news" 
                className="block text-slate-400 hover:text-white transition-colors text-sm"
              >
                RSS Feed
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800/50 dark:border-slate-800/50 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-400 text-sm">
              © 2024 Coin Feedly. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-slate-400 text-sm">
              <span>Powered by Real-time APIs</span>
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
