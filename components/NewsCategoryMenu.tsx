'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Home, 
  BarChart3, 
  TrendingUp, 
  Coins, 
  Zap, 
  Globe,
  Moon,
  Sun
} from 'lucide-react'

interface NewsCategoryMenuProps {
  currentCategory?: string
}

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
      // Add a small delay to prevent immediate closing when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const navigationItems = [
    { name: 'All News', href: '/', icon: Home },
    { name: 'Charts', href: '/charts', icon: BarChart3 }
  ]

  const categories = [
    { name: 'Bitcoin', slug: 'bitcoin', icon: TrendingUp },
    { name: 'Altcoins', slug: 'altcoins', icon: Coins },
    { name: 'DeFi', slug: 'defi', icon: Zap },
    { name: 'Macro', slug: 'macro', icon: Globe }
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
      >
        <div className="w-6 h-6 relative">
          {!isOpen ? (
            // Hamburger menu
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col space-y-1.5 transition-all duration-300">
              <div className="w-3.5 h-0.5 bg-current transition-all duration-300"></div>
              <div className="w-3.5 h-0.5 bg-current transition-all duration-300"></div>
              <div className="w-3.5 h-0.5 bg-current transition-all duration-300"></div>
            </div>
          ) : (
            // X icon
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300">
              <div className="w-3.5 h-0.5 bg-current rotate-45 transition-all duration-300"></div>
              <div className="w-3.5 h-0.5 bg-current -rotate-45 -translate-y-0.5 transition-all duration-300"></div>
            </div>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute left-0 top-full mt-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300"
          data-dropdown="true"
          style={{ 
            zIndex: 9999,
            minWidth: '300px',
            width: '300px',
            maxWidth: '90vw'
          }}
        >
          <div className="p-2">
            {/* Navigation Section */}
            <div className="mb-2">
              {navigationItems.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      setIsOpen(false)
                    }}
                    className="flex items-center space-x-3 px-3 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 group animate-in slide-in-from-left-2 fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <IconComponent className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>

            {/* Categories Section */}
            <div className="mb-2">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider animate-in slide-in-from-left-2 fade-in" style={{ animationDelay: '100ms' }}>
                Categories
              </div>
              {categories.map((category, index) => {
                const IconComponent = category.icon
                const isActive = currentCategory === category.slug
                return (
                  <Link
                    key={category.slug}
                    href={`/category/${category.slug}`}
                    onClick={() => {
                      setIsOpen(false)
                    }}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group animate-in slide-in-from-left-2 fade-in ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    style={{ animationDelay: `${(index + 2) * 50}ms` }}
                  >
                    <IconComponent className={`w-4 h-4 transition-colors duration-200 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`} />
                    <span className="font-medium">{category.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-in zoom-in duration-200" style={{ animationDelay: `${(index + 2) * 50 + 100}ms` }}></div>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                toggleTheme()
                setIsOpen(false)
              }}
              className="flex items-center space-x-3 px-3 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 w-full group animate-in slide-in-from-left-2 fade-in"
              style={{ animationDelay: '350ms' }}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
              )}
              <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}