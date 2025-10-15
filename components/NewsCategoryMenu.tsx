'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, Newspaper, BarChart3, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

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
        <Newspaper className="w-4 h-4" />
        <span className="font-medium">Menu</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
          <div className="py-2">
            {/* News Link */}
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Newspaper className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <div>
                <div className="font-medium">News</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Latest crypto news</div>
              </div>
            </Link>

            {/* Charts Link */}
            <Link
              href="/charts"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-slate-500 dark:text-slate-400" />
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
              className="w-full flex items-center space-x-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              )}
              <div>
                <div className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Toggle theme</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
