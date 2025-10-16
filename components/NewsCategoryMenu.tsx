'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Newspaper, BarChart3, Moon, Sun, Bitcoin, Coins, Zap, TrendingUp, Globe, Image, Gamepad2, Box } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface NewsCategoryMenuProps {
  currentCategory?: string
}

const categories = [
  { 
    id: 'bitcoin', 
    name: 'Bitcoin', 
    icon: Bitcoin,
    href: '/category/bitcoin'
  },
  { 
    id: 'altcoins', 
    name: 'Altcoins', 
    icon: Coins,
    href: '/category/altcoins'
  },
  { 
    id: 'defi', 
    name: 'DeFi', 
    icon: Zap,
    href: '/category/defi'
  },
  { 
    id: 'macro', 
    name: 'Macro', 
    icon: TrendingUp,
    href: '/category/macro'
  },
  { 
    id: 'web3', 
    name: 'Web3', 
    icon: Globe,
    href: '/category/web3'
  },
  { 
    id: 'nft', 
    name: 'NFT', 
    icon: Image,
    href: '/category/nft'
  },
  { 
    id: 'gaming', 
    name: 'Gaming', 
    icon: Gamepad2,
    href: '/category/gaming'
  },
  { 
    id: 'metaverse', 
    name: 'Metaverse', 
    icon: Box,
    href: '/category/metaverse'
  }
]

export default function NewsCategoryMenu({ currentCategory = 'all' }: NewsCategoryMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { isDarkMode, toggleTheme } = useTheme()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 group font-medium"
      >
        <Menu className="w-5 h-5" />
        <span className="font-medium">Menu</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50">
          <div className="p-4">
            {/* Main Navigation */}
            <div className="space-y-2 mb-4">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Navigation
              </div>
              
              {/* All News Link */}
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium">All News</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Latest crypto news</div>
                </div>
              </Link>

              {/* Charts Link */}
              <Link
                href="/charts"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-medium">Charts</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Crypto price charts</div>
                </div>
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={() => {
                  toggleTheme()
                  setIsOpen(false)
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Toggle theme</div>
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700 mb-4"></div>

            {/* News Categories */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                News Categories
              </div>
              {categories.map((category) => {
                const IconComponent = category.icon
                const isActive = category.id === currentCategory
                
                return (
                  <Link
                    key={category.id}
                    href={category.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-800/30'
                        : 'bg-slate-100 dark:bg-slate-700'
                    }`}>
                      <IconComponent className={`w-4 h-4 ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        isActive
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {category.name}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}