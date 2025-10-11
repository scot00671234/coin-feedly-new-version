'use client'

import { Category } from '@/types'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  setSelectedCategory: (category: string) => void
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  setSelectedCategory 
}: CategoryFilterProps) {
  const getCategoryClass = (categoryId: string) => {
    const baseClass = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer text-sm"
    
    if (selectedCategory === categoryId) {
      return `${baseClass} bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25`
    }
    
    return `${baseClass} glass-effect text-slate-300 hover:text-white hover:bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50`
  }

  const getCategoryBadgeClass = (categoryId: string) => {
    switch (categoryId) {
      case 'bitcoin':
        return 'category-bitcoin'
      case 'altcoins':
        return 'category-altcoins'
      case 'defi':
        return 'category-defi'
      case 'macro':
        return 'category-macro'
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => setSelectedCategory(category.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span>{category.name}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              selectedCategory === category.id
                ? 'bg-blue-500/20 text-blue-200'
                : 'bg-slate-400/50 dark:bg-slate-600/50 text-slate-600 dark:text-slate-400'
            }`}>
              {category.count}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
