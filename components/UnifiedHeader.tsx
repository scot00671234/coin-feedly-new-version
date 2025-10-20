'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Search, Moon, Sun, Menu, X } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface UnifiedHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSearch?: () => void
  searchPlaceholder?: string
}

export default function UnifiedHeader({ searchQuery, setSearchQuery, onSearch, searchPlaceholder }: UnifiedHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isDarkMode, toggleTheme } = useTheme()
  const pathname = usePathname()

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch()
    }
  }

  // Get appropriate placeholder text based on current page
  const getPlaceholderText = () => {
    if (searchPlaceholder) return searchPlaceholder
    return pathname === '/charts' 
      ? 'Search cryptocurrencies...' 
      : 'Search crypto news, analysis, and market insights...'
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Image 
                src="/logo.svg" 
                alt="Coin Feedly Logo" 
                width={40} 
                height={40}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
              Coin Feedly
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="w-full relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={getPlaceholderText()}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isActive('/')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Home
            </Link>
            
            <Link
              href="/charts"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isActive('/charts')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Charts
            </Link>
            
            <Link
              href="/polymarket"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isActive('/polymarket')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Polymarket
            </Link>
            
            <Link
              href="/fear-greed"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isActive('/fear-greed')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Fear & Greed
            </Link>
            
            <button
              onClick={toggleTheme}
              className="group flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              ) : (
                <Moon className="w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12" />
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-md hover:shadow-blue-500/10 hover:ring-1 hover:ring-blue-500/10 transition-all duration-300"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200/50 dark:border-slate-800/50 py-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
            <div className="space-y-4">
              {/* Mobile Navigation Menu */}
              <div className="px-4 py-2">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4 tracking-wider uppercase">Navigation</div>
                <div className="space-y-1">
                  <Link 
                    href="/" 
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isActive('/')
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Home
                  </Link>
                  <Link 
                    href="/charts" 
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isActive('/charts')
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Charts
                  </Link>
                  <Link 
                    href="/polymarket" 
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isActive('/polymarket')
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Polymarket
                  </Link>
                  <Link 
                    href="/fear-greed" 
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isActive('/fear-greed')
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Fear & Greed
                  </Link>
                </div>
              </div>

              {/* Mobile Theme Toggle */}
              <div className="px-4 py-2">
                <button
                  onClick={() => {
                    toggleTheme()
                    setIsMenuOpen(false)
                  }}
                  className="group flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-300 w-full"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  ) : (
                    <Moon className="w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12" />
                  )}
                  <span className="font-medium text-sm tracking-wide">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>

              {/* Mobile Search */}
              <div className="px-4 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={getPlaceholderText()}
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onKeyPress={handleSearchKeyPress}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
