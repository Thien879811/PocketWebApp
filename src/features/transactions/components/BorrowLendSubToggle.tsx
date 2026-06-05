import React from 'react'
import { cn } from '@/utils/cn'
import { TRANSACTION_TYPES_METADATA, type TransactionType } from '@/types/transaction.types'

interface BorrowLendSubToggleProps {
  value: TransactionType
  onChange: (type: 'borrow' | 'lend') => void
}

export const BorrowLendSubToggle: React.FC<BorrowLendSubToggleProps> = ({ value, onChange }) => {
  if (value !== 'borrow' && value !== 'lend') return null
  return (
    <div className="animate-in fade-in slide-in-from-top-2">
      <div className="bg-surface-container rounded-xl p-1 flex gap-1">
        {(['borrow', 'lend'] as const).map(typeKey => {
          const meta = TRANSACTION_TYPES_METADATA[typeKey]
          return (
            <button
              key={typeKey}
              type="button"
              onClick={() => onChange(typeKey)}
              className={cn(
                'flex-1 py-2 rounded-lg text-xs font-semibold transition-all',
                value === typeKey
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant/70'
              )}
            >
              {meta.label} ({meta.prefix})
            </button>
          )
        })}
      </div>
      <p className="text-[9px] text-on-surface-variant/60 font-bold mt-2 px-2 italic text-center">
        * Giao dịch này chỉ ảnh hưởng ví, không tính vào kế hoạch chi tiêu.
      </p>
    </div>
  )
}
