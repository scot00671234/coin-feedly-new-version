'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true) // Default to dark mode
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Check for saved theme preference
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark')
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDarkMode(prefersDark)
      }
      setIsInitialized(true)
    }
  }, [])

  useEffect(() => {
    if (!isInitialized) return

    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
    }
  }, [isDarkMode, isInitialized])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const setTheme = (theme: 'light' | 'dark') => {
    setIsDarkMode(theme === 'dark')
  }

  // Don't render children until theme is initialized to prevent flash
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
