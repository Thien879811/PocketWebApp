import React from 'react'
import { cn } from '@/utils/cn'

export interface ColorOption {
  name: string
  class: string
}

interface ColorSelectorGridProps {
  colors: ColorOption[]
  selected: string
  onSelect: (colorClass: string) => void
  /** Tailwind grid-cols class, mặc định "grid-cols-5" */
  gridClass?: string
}

export const ColorSelectorGrid: React.FC<ColorSelectorGridProps> = ({
  colors,
  selected,
  onSelect,
  gridClass = 'grid-cols-5',
}) => (
  <div className={cn('grid gap-4', gridClass)}>
    {colors.map(color => (
      <button
        key={color.name}
        type="button"
        title={color.name}
        onClick={() => onSelect(color.class)}
        className={cn(
          'aspect-square rounded-2xl border-4 transition-all duration-300 transform hover:scale-110 active:scale-90',
          color.class,
          selected === color.class
            ? 'border-white shadow-xl scale-110'
            : 'border-transparent opacity-80'
        )}
      />
    ))}
  </div>
)
