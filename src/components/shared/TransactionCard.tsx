import React from 'react'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/format'
import { TRANSACTION_TYPES_METADATA, type TransactionType } from '@/types/transaction.types'
import type { Category } from '@/features/categories/types/category.schema'

const TYPE_LEFT_ACCENT: Record<TransactionType, string> = {
  income: 'border-l-secondary',
  expense: 'border-l-error',
  withdrawal: 'border-l-amber-500',
  borrow: 'border-l-purple-500',
  lend: 'border-l-blue-500',
  business: 'border-l-orange-500',
}

interface TransactionCardTx {
  id: string
  type: TransactionType
  amount: number
  note?: string | null
  date: string
  category_id?: string | null
}

interface TransactionCardProps {
  tx: TransactionCardTx
  categories?: Category[]
  index: number
  onClick?: () => void
  showDate?: boolean
  /** Đảo ưu tiên: Note là dòng chính (lớn hơn), ngày là dòng phụ, ẩn tên danh mục */
  noteFirst?: boolean
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  tx,
  categories,
  index,
  onClick,
  showDate = false,
  noteFirst = false,
}) => {
  const meta = TRANSACTION_TYPES_METADATA[tx.type]
  const category = categories?.find(c => c.id === tx.category_id)

  const icon = category?.icon || meta?.icon || 'help_outline'
  const categoryName = category?.name || meta?.label || 'Giao dịch'
  const categoryColor = category?.color || 'bg-surface-container-high'

  const isAlternate = index % 2 === 1

  const dateLabel = showDate || noteFirst
    ? new Date(tx.date).toLocaleDateString('vi-VN', { weekday: 'short', month: 'short', day: 'numeric' })
    : null

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3.5 py-3.5 pr-4 rounded-xl transition-all text-left active:scale-[0.99]',
        isAlternate
          ? cn(
              'pl-3.5 bg-surface-container',
              'border border-outline-variant/10 border-l-4',
              TYPE_LEFT_ACCENT[tx.type],
              'hover:bg-surface-container-high'
            )
          : 'pl-4 bg-surface-container-lowest border border-outline-variant/15 shadow-sm hover:bg-surface-container'
      )}
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', categoryColor)}>
        <span className="material-symbols-outlined text-[18px] text-white">{icon}</span>
      </div>

      {noteFirst ? (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-on-surface truncate">
            {tx.note || categoryName}
          </p>
          <p className="text-[11px] text-on-surface-variant/55 font-medium mt-0.5 truncate">
            {dateLabel}
            {tx.note && categoryName ? ` · ${categoryName}` : ''}
          </p>
        </div>
      ) : (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">{categoryName}</p>
          {(dateLabel || tx.note) && (
            <p className="text-[11px] text-on-surface-variant/60 font-medium mt-0.5 truncate">
              {[dateLabel, tx.note].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      )}

      <p className={cn('text-sm font-bold flex-shrink-0 tabular-nums', meta?.color || 'text-on-surface')}>
        {meta?.prefix || '-'}{formatCurrency(tx.amount)}
      </p>
    </button>
  )
}
