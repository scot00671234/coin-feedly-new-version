'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, Bitcoin, Coins, Zap, TrendingUp, Image, Gamepad2, Box, Newspaper } from 'lucide-react'

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 backdrop-blur-xl">
          <div className="p-2">
            {categories.map((category) => {
              const IconComponent = category.icon
              const isActive = category.id === currentCategory
              
              return (
                <Link
                  key={category.id}
                  href={category.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-800/30'
                      : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'
                  } transition-colors duration-200`}>
                    <IconComponent className={`w-4 h-4 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    } transition-colors duration-200`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${
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
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2"></div>
                  )}
                </Link>
              )
            })}
          </div>
          
          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Stay updated with the latest crypto news
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
