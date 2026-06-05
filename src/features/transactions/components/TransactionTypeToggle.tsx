import React from 'react'
import { cn } from '@/utils/cn'
import { TRANSACTION_TYPES_METADATA, type TransactionType } from '@/types/transaction.types'

const TYPE_OPTIONS = ['income', 'expense', 'withdrawal', 'borrow', 'business'] as const

interface TransactionTypeToggleProps {
  value: TransactionType
  onChange: (type: 'income' | 'expense' | 'withdrawal' | 'borrow' | 'business') => void
}

export const TransactionTypeToggle: React.FC<TransactionTypeToggleProps> = ({ value, onChange }) => (
  <div className="bg-surface-container rounded-2xl p-1 flex gap-1 overflow-x-auto scrollbar-hide">
    {TYPE_OPTIONS.map(typeKey => {
      const meta = TRANSACTION_TYPES_METADATA[typeKey]
      const active = typeKey === 'borrow'
        ? (value === 'borrow' || value === 'lend')
        : value === typeKey
      return (
        <button
          key={typeKey}
          type="button"
          onClick={() => onChange(typeKey)}
          className={cn(
            'flex-shrink-0 px-3.5 py-2 rounded-xl text-[11px] font-semibold transition-all whitespace-nowrap',
            active
              ? 'bg-surface-container-lowest text-on-surface shadow-sm'
              : 'text-on-surface-variant/60 hover:text-on-surface'
          )}
        >
          {typeKey === 'borrow' ? 'Mượn/Trả' : meta.label}
        </button>
      )
    })}
  </div>
)
