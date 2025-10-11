'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Sun, Moon } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
      <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl rounded-full border border-slate-800/50 dark:border-slate-800/50 border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Image 
                  src="/logo.svg" 
                  alt="Coin Feedly Logo" 
                  width={32} 
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">Coin Feedly</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link href="/" className="text-slate-700 dark:text-white bg-slate-200/50 dark:bg-slate-800/50 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200">
                Home
              </Link>
              <Link href="/bitcoin" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/30 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200">
                Bitcoin
              </Link>
              <Link href="/altcoins" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/30 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200">
                Altcoins
              </Link>
              <Link href="/defi" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/30 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200">
                DeFi
              </Link>
              <Link href="/macro" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/30 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200">
                Macro
              </Link>
            </nav>

            {/* Right side elements */}
            <div className="hidden lg:flex items-center space-x-3">
              <button 
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/30 rounded-full transition-all duration-200"
              >
                {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button className="flex items-center space-x-2 bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 px-3 py-2 rounded-full transition-all duration-200">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-slate-700 dark:text-white text-sm font-medium">Live</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/30 transition-all duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-200/50 dark:border-slate-800/50">
              <nav className="flex flex-col space-y-2">
                <Link 
                  href="/" 
                  className="text-slate-700 dark:text-white bg-slate-200/50 dark:bg-slate-800/50 px-4 py-3 rounded-full font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/bitcoin" 
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/30 px-4 py-3 rounded-full font-medium transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Bitcoin
                </Link>
                <Link 
                  href="/altcoins" 
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/30 px-4 py-3 rounded-full font-medium transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Altcoins
                </Link>
                <Link 
                  href="/defi" 
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/30 px-4 py-3 rounded-full font-medium transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  DeFi
                </Link>
                <Link 
                  href="/macro" 
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/30 px-4 py-3 rounded-full font-medium transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Macro
                </Link>
                <div className="flex items-center justify-between pt-2">
                  <button 
                    onClick={toggleTheme}
                    className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/30 transition-all duration-200"
                  >
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <span className="text-sm font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
