import React from 'react'
import { cn } from '@/utils/cn'
import { TRANSACTION_TYPES_METADATA, type TransactionType } from '@/types/transaction.types'

const TYPE_OPTIONS = ['income', 'expense', 'savings', 'business', 'withdrawal', 'borrow'] as const

interface TransactionTypeSelectorProps {
  value: TransactionType
  onChange: (type: TransactionType) => void
}

export const TransactionTypeSelector: React.FC<TransactionTypeSelectorProps> = ({
  value,
  onChange,
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 p-1.5 glass rounded-2xl gap-2 dark:shadow-glass-dark">
    {TYPE_OPTIONS.map(key => {
      const meta = TRANSACTION_TYPES_METADATA[key]
      return (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            'flex items-center justify-center gap-2 py-3 px-2 rounded-xl font-bold smooth-transition active:scale-95 transform hover:scale-105',
            value === key
              ? 'glass dark:shadow-glow-primary text-primary'
              : 'bg-surface-container-highest text-on-surface-variant dark:hover:shadow-glass-dark'
          )}
        >
          <span className="material-symbols-outlined text-base">{meta.icon}</span>
          <span className="text-[10px] sm:text-xs truncate">{meta.shortLabel}</span>
        </button>
      )
    })}
  </div>
)
