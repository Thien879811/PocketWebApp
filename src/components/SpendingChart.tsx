import React from 'react'
import { formatCurrency } from '@/utils/format'

interface SpendingChartProps {
  data: number[] // Expecting 5 weeks of data
  totalSpent: number
}

export const SpendingChart: React.FC<SpendingChartProps> = ({ data, totalSpent }) => {
  const maxVal = Math.max(...data, 1000000) // Minimum scale of 1M

  return (
    <div className="bg-surface-container-lowest p-6 rounded-[2.5rem] border border-outline-variant/10 shadow-sm dark:shadow-dark mx-2">
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="font-label text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40 mb-1">Xu hướng tuần</p>
          <p className="font-headline font-black text-xl text-on-surface tracking-tighter italic">Biểu đồ chi tiêu</p>
        </div>
         <div className="text-right">
            <p className="font-headline font-black text-lg text-primary leading-none dark:glow">{formatCurrency(totalSpent)}</p>
            <p className="text-[10px] font-black uppercase tracking-tighter opacity-40">Tổng chi tiêu</p>
         </div>
      </div>

      <div className="flex items-end justify-between h-32 gap-3 px-2">
        {data.map((val, i) => {
          const height = (val / maxVal) * 100
          return (
            <div key={i} className="flex-1 flex flex-col items-center group relative">
              <div 
                className="w-full bg-primary/10 rounded-t-xl group-hover:bg-primary/20 transition-all duration-500 relative flex flex-col justify-end overflow-hidden" 
                style={{ height: '100%' }}
              >
                <div 
                  className="w-full bg-primary rounded-t-xl transition-all duration-1000 shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)] dark:shadow-glow-primary" 
                  style={{ height: `${height}%` }}
                >
                   {val > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-on-surface text-surface text-[8px] font-black px-1.5 py-0.5 rounded pointer-events-none">
                        {formatCurrency(val)}
                      </div>
                   )}
                </div>
              </div>
              <span className="text-[9px] font-black uppercase text-on-surface-variant opacity-40 mt-3">Tuần {i + 1}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
