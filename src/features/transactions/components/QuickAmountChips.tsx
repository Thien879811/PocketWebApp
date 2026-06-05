import React from 'react'
import { cn } from '@/utils/cn'

const QUICK_VALUES = [1, 2, 5, 10, 20, 50, 100, 200, 500] as const

interface QuickAmountChipsProps {
  onAdd: (val: number) => void
  className?: string
}

export const QuickAmountChips: React.FC<QuickAmountChipsProps> = ({ onAdd, className }) => (
  <div className={cn('flex flex-wrap justify-center gap-2', className)}>
    {QUICK_VALUES.map(val => (
      <button
        key={val}
        type="button"
        onClick={() => onAdd(val * 1000)}
        className="px-3 py-1.5 bg-surface-container rounded-full text-xs font-semibold text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors flex-shrink-0"
      >
        +{val}k
      </button>
    ))}
  </div>
)
