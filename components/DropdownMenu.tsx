'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

interface DropdownItem {
  href: string
  label: string
  icon?: React.ReactNode
  description?: string
}

interface DropdownMenuProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  className?: string
}

export default function DropdownMenu({ trigger, items, className = '' }: DropdownMenuProps) {
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

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-2 rounded-md font-medium text-sm transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        {trigger}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200/50 dark:border-slate-700/50 py-1 z-50 backdrop-blur-sm">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`px-3 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150 group first:rounded-t-lg last:rounded-b-lg ${
                item.icon ? 'flex items-center space-x-3' : 'block'
              }`}
            >
              {item.icon && (
                <div className="flex-shrink-0 w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-150">
                  {item.icon}
                </div>
              )}
              <div className={item.icon ? "flex-1 min-w-0" : ""}>
                <div className="font-medium text-sm text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-white transition-colors duration-150">
                  {item.label}
                </div>
                {item.description && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    {item.description}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
