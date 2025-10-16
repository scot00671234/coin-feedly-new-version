'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Search, Moon, Sun, Menu, X } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import NewsCategoryMenu from './NewsCategoryMenu'

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
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-lg overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-visible">
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

          {/* Desktop Search - Moved to left */}
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

          {/* Desktop Navigation - Moved to right */}
          <div className="flex items-center space-x-1 relative overflow-visible">
            <NewsCategoryMenu currentCategory={pathname.includes('/category/') ? pathname.split('/category/')[1] : 'all'} />
          </div>

          {/* Right side elements */}
          <div className="flex items-center space-x-2">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-md hover:shadow-blue-500/10 hover:ring-1 hover:ring-blue-500/10 transition-all duration-300"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 py-4">
            <div className="space-y-2">
              {/* Mobile Navigation Menu */}
              <div className="px-4 py-2">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Navigation</div>
                <div className="space-y-2">
                  <Link href="/" className="block px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    All News
                  </Link>
                  <Link href="/charts" className="block px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    Charts
                  </Link>
                </div>
              </div>

              {/* Mobile Categories */}
              <div className="px-4 py-2">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Categories</div>
                <div className="space-y-2">
                  <Link href="/category/bitcoin" className="block px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    Bitcoin
                  </Link>
                  <Link href="/category/altcoins" className="block px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    Altcoins
                  </Link>
                  <Link href="/category/defi" className="block px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    DeFi
                  </Link>
                  <Link href="/category/macro" className="block px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    Macro
                  </Link>
                </div>
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
