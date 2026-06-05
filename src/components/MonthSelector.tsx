import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const handlePrevMonth = () =>
    onDateChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))

  const handleNextMonth = () =>
    onDateChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))

  const handleResetDate = () => onDateChange(new Date())

  const isCurrentMonth =
    selectedDate.getMonth() === new Date().getMonth() &&
    selectedDate.getFullYear() === new Date().getFullYear()

  const monthName = selectedDate.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex items-center gap-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-1.5 shadow-card">
      <button
        onClick={handlePrevMonth}
        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-container transition-colors active:scale-90 flex-shrink-0"
        aria-label="Tháng trước"
      >
        <ChevronLeft size={18} className="text-on-surface-variant" />
      </button>

      <button
        onClick={handleResetDate}
        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl hover:bg-surface-container transition-colors active:scale-95"
        aria-label="Về tháng hiện tại"
      >
        <span className="text-sm font-semibold text-on-surface capitalize">
          {monthName}
        </span>
        {!isCurrentMonth && (
          <span className="text-[10px] text-primary bg-primary/10 rounded-full px-1.5 py-0.5 font-semibold">
            Reset
          </span>
        )}
      </button>

      <button
        onClick={handleNextMonth}
        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-container transition-colors active:scale-90 flex-shrink-0"
        aria-label="Tháng sau"
      >
        <ChevronRight size={18} className="text-on-surface-variant" />
      </button>
    </div>
  )
}
