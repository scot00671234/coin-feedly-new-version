'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, Bitcoin, Coins, Zap, TrendingUp, Globe, Image, Gamepad2, Box, Newspaper, BarChart3, Moon, Sun, X } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface NewsCategoryMenuProps {
  currentCategory?: string
}

const categories = [
  { 
    id: 'all', 
    name: 'All News', 
    icon: Newspaper,
    description: 'Latest crypto news from all categories',
    href: '/'
  },
  { 
    id: 'bitcoin', 
    name: 'Bitcoin', 
    icon: Bitcoin,
    description: 'Bitcoin news, analysis, and updates',
    href: '/category/bitcoin'
  },
  { 
    id: 'altcoins', 
    name: 'Altcoins', 
    icon: Coins,
    description: 'Ethereum, Solana, and other cryptocurrencies',
    href: '/category/altcoins'
  },
  { 
    id: 'defi', 
    name: 'DeFi', 
    icon: Zap,
    description: 'Decentralized finance protocols and yield farming',
    href: '/category/defi'
  },
  { 
    id: 'macro', 
    name: 'Macro', 
    icon: TrendingUp,
    description: 'Market analysis, regulation, and economic trends',
    href: '/category/macro'
  },
  { 
    id: 'web3', 
    name: 'Web3', 
    icon: Globe,
    description: 'Web3 infrastructure and decentralized applications',
    href: '/category/web3'
  },
  { 
    id: 'nft', 
    name: 'NFT', 
    icon: Image,
    description: 'Non-fungible tokens and digital collectibles',
    href: '/category/nft'
  },
  { 
    id: 'gaming', 
    name: 'Gaming', 
    icon: Gamepad2,
    description: 'Crypto gaming and play-to-earn projects',
    href: '/category/gaming'
  },
  { 
    id: 'metaverse', 
    name: 'Metaverse', 
    icon: Box,
    description: 'Virtual worlds and metaverse platforms',
    href: '/category/metaverse'
  }
]

export default function NewsCategoryMenu({ currentCategory = 'all' }: NewsCategoryMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { isDarkMode, toggleTheme } = useTheme()

  // Close dropdown when clicking outside and manage body scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const currentCategoryData = categories.find(cat => cat.id === currentCategory) || categories[0]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 group font-medium"
      >
        <currentCategoryData.icon className="w-4 h-4" />
        <span className="font-medium">{currentCategoryData.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Modern Slide-in Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Slide-in Menu */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Menu
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-1">
                  {/* Charts Link */}
                  <Link
                    href="/charts"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors group"
                  >
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                      <BarChart3 className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium">Charts</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Crypto price charts</div>
                    </div>
                  </Link>

                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors group"
                  >
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                      {isDarkMode ? (
                        <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                      ) : (
                        <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Toggle theme</div>
                    </div>
                  </button>

                  {/* Divider */}
                  <div className="my-4 border-t border-slate-100 dark:border-slate-800"></div>

                  {/* Categories */}
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
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <div className={`p-2 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-blue-100 dark:bg-blue-800/30'
                              : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'
                          }`}>
                            <IconComponent className={`w-4 h-4 transition-colors ${
                              isActive
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium ${
                              isActive
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300'
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
