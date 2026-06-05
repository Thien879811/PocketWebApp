import React from 'react'
import { cn } from '@/utils/cn'

interface IconSelectorGridProps {
  icons: string[]
  selected: string
  onSelect: (icon: string) => void
  /** Tailwind grid-cols class, e.g. "grid-cols-4" or "grid-cols-5 md:grid-cols-10" */
  gridClass?: string
  iconSize?: string
  /** Dùng Material Symbols FILL variation cho icon đang được chọn */
  fillSelected?: boolean
}

export const IconSelectorGrid: React.FC<IconSelectorGridProps> = ({
  icons,
  selected,
  onSelect,
  gridClass = 'grid-cols-4',
  iconSize = 'text-2xl',
  fillSelected = false,
}) => (
  <div className={cn('grid gap-4', gridClass)}>
    {icons.map(icon => (
      <button
        key={icon}
        type="button"
        onClick={() => onSelect(icon)}
        className={cn(
          'aspect-square flex items-center justify-center rounded-2xl smooth-transition active:scale-90 transform hover:scale-110',
          selected === icon
            ? 'glass dark:shadow-glow-primary text-primary border-2 border-primary/20 scale-105'
            : 'bg-surface-container-highest text-on-surface-variant/60'
        )}
      >
        <span
          className={`material-symbols-outlined ${iconSize}`}
          style={fillSelected
            ? { fontVariationSettings: `'FILL' ${selected === icon ? 1 : 0}` }
            : undefined}
        >
          {icon}
        </span>
      </button>
    ))}
  </div>
)
