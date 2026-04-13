import React from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface MonthSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedDate, onDateChange }) => {
  const handlePrevMonth = () => {
    onDateChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    onDateChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))
  }

  const handleResetDate = () => {
    onDateChange(new Date())
  }

  return (
    <section className="bg-surface-container-low p-5 rounded-[2.5rem] border border-outline-variant/10 shadow-sm flex items-center justify-between mx-2">
      <button 
        onClick={handlePrevMonth}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface hover:bg-white transition-all shadow-sm active:scale-90"
      >
        <ChevronLeft size={20} className="text-on-surface-variant" />
      </button>

      <div 
        onClick={handleResetDate}
        className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-2 mb-0.5">
          <Calendar size={14} className="text-primary" />
          <span className="font-label text-[10px] font-black uppercase tracking-[0.2em] text-primary opacity-60">
            {selectedDate.getFullYear()}
          </span>
        </div>
        <h3 className="font-headline font-black text-xl text-on-surface tracking-tight uppercase leading-none">
          Tháng {selectedDate.getMonth() + 1}
        </h3>
      </div>

      <button 
        onClick={handleNextMonth}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface hover:bg-white transition-all shadow-sm active:scale-90"
      >
        <ChevronRight size={20} className="text-on-surface-variant" />
      </button>
    </section>
  )
}
