'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export default function SearchBar({ searchQuery, setSearchQuery }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className="relative max-w-3xl mx-auto">
      <div className={`relative transition-all duration-500 ${
        isFocused ? 'ring-2 ring-blue-500/50 ring-opacity-50 scale-[1.02]' : ''
      }`}>
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-slate-500 dark:text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search crypto news, analysis, and market insights..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full pl-16 pr-16 py-5 bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/50 dark:border-slate-600/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-500 text-lg shadow-lg"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors duration-300"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      
      {searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-slate-200/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-300/50 dark:border-slate-600/50 rounded-xl shadow-2xl z-10 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Searching for: <span className="text-slate-900 dark:text-white font-bold">"{searchQuery}"</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
