import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Inbox, LayoutGrid } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Category } from '../../categories/types/category.schema'
import type { TransactionType } from '@/types/transaction.types'

interface CategoryGridProps {
  categories: Category[]
  selectedId: string | undefined
  onSelect: (id: string) => void
  transactionType: TransactionType
  isLoading?: boolean
  showAddButton?: boolean
}

const isIncomeType = (t: TransactionType) => t === 'income' || t === 'borrow' || t === 'lend'

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedId,
  onSelect,
  transactionType,
  isLoading = false,
  showAddButton = false,
}) => {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <button
        type="button"
        onClick={() => navigate('/settings/categories/add')}
        className="w-full bg-surface-container rounded-2xl p-6 text-center border-2 border-dashed border-outline-variant/30 hover:border-primary/40 transition-colors"
      >
        <Inbox size={22} className="text-on-surface-variant/40 mx-auto mb-2" />
        <p className="text-xs text-on-surface-variant/60 font-medium">Chưa có danh mục</p>
        <p className="text-xs text-primary font-semibold mt-1">Thêm ngay →</p>
      </button>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-2.5">
      {categories.map(cat => {
        const active = selectedId === cat.id
        const income = isIncomeType(transactionType)
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              'flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 active:scale-90',
              active
                ? cn('ring-2 shadow-sm', income
                    ? 'bg-secondary/10 text-secondary ring-secondary/30'
                    : 'bg-primary/10 text-primary ring-primary/30')
                : 'bg-surface-container hover:bg-surface-container-high'
            )}
          >
            <span
              className={cn(
                'material-symbols-outlined text-[22px] transition-colors',
                active
                  ? income ? 'text-secondary' : 'text-primary'
                  : 'text-on-surface-variant'
              )}
              style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
            >
              {cat.icon}
            </span>
            <span className="text-[10px] font-semibold text-on-surface-variant truncate w-full text-center leading-none">
              {cat.name}
            </span>
          </button>
        )
      })}
      {showAddButton && (
        <button
          type="button"
          onClick={() => navigate('/settings/categories/add')}
          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-surface-container border-2 border-dashed border-outline-variant/30 text-on-surface-variant/50 hover:text-primary hover:border-primary/40 transition-all active:scale-90"
        >
          <LayoutGrid size={20} />
          <span className="text-[10px] font-semibold">Mới</span>
        </button>
      )}
    </div>
  )
}
