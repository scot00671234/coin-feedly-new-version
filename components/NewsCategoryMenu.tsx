'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, Bitcoin, Coins, Zap, TrendingUp, Globe, Image, Gamepad2, Box, Newspaper } from 'lucide-react'

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
        className="flex items-center space-x-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md hover:shadow-blue-500/20 hover:ring-1 hover:ring-blue-500/20 rounded-lg transition-all duration-300 group font-medium"
      >
        <currentCategoryData.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
        <span className="font-medium">{currentCategoryData.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Slide-in Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Slide-in Menu */}
          <div className={`absolute right-0 top-0 h-full w-96 max-w-[90vw] bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  News Categories
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Categories List */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {categories.map((category) => {
                    const IconComponent = category.icon
                    const isActive = category.id === currentCategory
                    
                    return (
                      <Link
                        key={category.id}
                        href={category.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-transparent'
                        }`}
                      >
                        <div className={`p-3 rounded-xl ${
                          isActive
                            ? 'bg-blue-100 dark:bg-blue-800/30'
                            : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'
                        } transition-colors duration-200`}>
                          <IconComponent className={`w-5 h-5 ${
                            isActive
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                          } transition-colors duration-200`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-lg ${
                            isActive
                              ? 'text-blue-700 dark:text-blue-300'
                              : 'text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300'
                          } transition-colors duration-200`}>
                            {category.name}
                          </div>
                          <div className={`text-sm mt-1 ${
                            isActive
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                          } transition-colors duration-200`}>
                            {category.description}
                          </div>
                        </div>
                        {isActive && (
                          <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
              
              {/* Footer */}
              <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6">
                <div className="text-center">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    Stay updated with the latest crypto news
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      Close
                    </button>
                    <Link
                      href="/"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                    >
                      View All News
                    </Link>
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
