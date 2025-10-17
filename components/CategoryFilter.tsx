'use client'

interface Category {
  id: string
  name: string
  count: number
}

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
  return (
    <div className="flex flex-wrap gap-2 sm:gap-1 justify-center">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => setSelectedCategory(category.id)}
          className={`px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium transition-all duration-200 rounded-lg sm:rounded-none ${
            selectedCategory === category.id
              ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg sm:bg-transparent sm:shadow-none sm:text-blue-600 dark:sm:text-blue-400 sm:border-b-2 sm:border-blue-600 dark:sm:border-blue-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 sm:bg-transparent sm:hover:bg-transparent sm:text-slate-600 dark:sm:text-slate-300 sm:hover:text-slate-900 dark:sm:hover:text-white'
          }`}
        >
          {category.name}
          {selectedCategory === category.id && (
            <span className="ml-1 text-xs sm:hidden">({category.count})</span>
          )}
        </button>
      ))}
    </div>
  )
}
