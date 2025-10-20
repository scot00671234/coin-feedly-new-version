'use client'

import { useState } from 'react'
import { ArrowLeft, RefreshCw, MoreHorizontal, ExternalLink } from 'lucide-react'

interface BrowserHeaderProps {
  url: string
  domain: string
  onClose: () => void
  onRefresh: () => void
  onOpenExternal?: () => void
  loading?: boolean
}

export default function BrowserHeader({ 
  url, 
  domain, 
  onClose, 
  onRefresh, 
  onOpenExternal,
  loading = false 
}: BrowserHeaderProps) {
  const [showUrl, setShowUrl] = useState(false)

  return (
    <div className="flex items-center justify-between p-2 md:p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Left side - Back button and URL */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Close browser"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <div className="flex-1 min-w-0">
          <div 
            className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 md:px-4 py-2 text-xs md:text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            onClick={() => setShowUrl(!showUrl)}
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="truncate">
                {showUrl ? url : domain}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center space-x-1 md:space-x-2 ml-2 md:ml-3">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
        
        {onOpenExternal && (
          <button
            onClick={onOpenExternal}
            className="p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Open in new tab"
          >
            <ExternalLink className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}
        
        <button
          className="p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  )
}
