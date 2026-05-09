import { formatCurrency } from '@/utils/format'
import { LoadingScreen } from '@/components/Loading'
import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Calendar, Info } from 'lucide-react'
import { useBudgetHistory } from '../hooks/useBudget'
import { useTransactions } from '../../transactions/hooks/useTransactions'
import { useCategories } from '../../categories/hooks/useCategories'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BudgetHistoryDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { data: plans, isLoading: plansLoading } = useBudgetHistory()
  const { data: transactions, isLoading: txLoading } = useTransactions()
  const { data: categories, isLoading: catLoading } = useCategories()

  const plan = plans?.find(p => p.id === id)

  if (plansLoading || txLoading || catLoading) {
    return <LoadingScreen message="Đang tải chi tiết ngân sách..." />
  }

  if (!plan) {
     return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8 text-center space-y-4">
           <Info className="w-12 h-12 text-outline" />
           <p className="text-on-surface font-bold text-lg">Không tìm thấy kế hoạch</p>
           <button onClick={() => navigate(-1)} className="px-6 py-2 bg-primary text-white rounded-full font-bold">Quay lại</button>
        </div>
     )
  }

  const filteredTransactions = useMemo(() => {
    if (!transactions || !categories) return transactions
    
    const excludedIds = categories
      .filter(c => {
        const name = c.name.toLowerCase()
        return name.includes('grap chi') || name.includes('grab chi') || name === 'nhà'
      })
      .map(c => c.id)

    if (excludedIds.length === 0) return transactions
    return transactions.filter(tx => {
      // Chỉ giữ lại type 'expense'
      if (tx.type !== 'expense') return false

      // Loại bỏ danh mục Grap chi
      return !tx.category_id || !excludedIds.includes(tx.category_id)
    })
  }, [transactions, categories])

  const planTransactions = filteredTransactions
    ?.filter(tx => tx.date >= plan.start_date && tx.date <= plan.end_date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || []

  const expenseTransactions = planTransactions.filter(tx => tx.type === 'expense')
  const totalSpent = expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0)
  const isExceeded = totalSpent > plan.total_budget
  const progress = Math.min(100, Math.max(0, (totalSpent / plan.total_budget) * 100))

  return (
    <div className="min-h-screen bg-surface dark:bg-background pb-24 md:p-8">
      <div className="w-full max-w-2xl mx-auto bg-surface dark:bg-surface-container-lowest relative flex flex-col md:rounded-[3rem] md:shadow-2xl dark:md:shadow-dark min-h-screen md:min-h-[800px] overflow-hidden">
        
        {/* HEADER */}
        <header className="sticky top-0 w-full z-20 flex items-center justify-between px-6 h-16 bg-surface/80 dark:bg-surface/60 backdrop-blur-md border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
             <button
               onClick={() => navigate(-1)}
               className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-95 duration-200"
             >
               <ChevronLeft className="w-6 h-6 text-on-surface" />
             </button>
             <h1 className="font-headline font-bold text-lg tracking-tight text-on-surface dark:glow">Chi tiết kỳ kế hoạch</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-8 no-scrollbar">
          
          {/* SUMMARY CARD */}
          <div className="bg-primary text-on-primary rounded-[2.5rem] p-6 relative overflow-hidden shadow-xl shadow-primary/20 dark:shadow-glow-primary group transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
               <div>
                  <p className="font-label text-[10px] uppercase tracking-widest font-black opacity-70 mb-1">Thời gian áp dụng</p>
                  <p className="font-headline font-black text-xl flex items-center gap-2 glow">
                     <Calendar size={20} className="text-white/80" />
                     {plan.start_date.split('-').slice(1).reverse().join('/')} — {plan.end_date.split('-').slice(1).reverse().join('/')}
                  </p>
               </div>
               
               <div className="bg-black/10 dark:bg-white/5 rounded-2xl p-5 backdrop-blur-md border border-white/10 space-y-4">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-wider">Tổng ngân sách</p>
                        <p className="font-headline font-black text-3xl tracking-tight leading-none">{formatCurrency(plan.total_budget)}<span className="text-sm opacity-60 ml-1">đ</span></p>
                     </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-black/20 dark:bg-black/30 rounded-full overflow-hidden border border-white/5">
                      <div 
                         className={cn("h-full rounded-full transition-all duration-1000", isExceeded ? "bg-red-400" : "bg-white dark:bg-primary-container")} 
                         style={{ width: `${progress}%` }} 
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider opacity-80">
                      <span className="flex items-center gap-1.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", isExceeded ? "bg-red-400 animate-pulse" : "bg-white")} />
                        Đã tiêu {formatCurrency(totalSpent)}
                      </span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* TRANSACTIONS LIST */}
          <div className="space-y-4">
             <h2 className="font-headline font-bold text-lg px-2 text-on-surface flex justify-between items-center">
                <span>Lịch sử giao dịch trong kỳ</span>
                <span className="text-xs font-bold text-on-surface-variant bg-surface-container py-1 px-3 rounded-full">{planTransactions.length} GD</span>
             </h2>

             {planTransactions.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed border-outline-variant/20 rounded-[2.5rem] bg-surface-container-low/30 backdrop-blur-sm">
                   <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4 opacity-40">
                      <Info size={32} />
                   </div>
                   <p className="text-sm font-bold text-on-surface-variant max-w-[180px] mx-auto opacity-60">Không có giao dịch nào được ghi nhận trong kỳ.</p>
                </div>
             ) : (
                <div className="bg-surface-container-lowest dark:bg-surface-container/30 dark:backdrop-blur-md rounded-[2rem] border border-outline-variant/10 overflow-hidden shadow-sm dark:shadow-dark">
                   {planTransactions.map((tx, idx) => {
                      const category = categories?.find(c => c.id === tx.category_id)
                      const isExpense = tx.type === 'expense'

                      return (
                         <div key={tx.id} className={cn(
                            "p-5 flex items-center justify-between transition-all hover:bg-primary/5 active:scale-[0.98] duration-200 cursor-pointer group",
                            idx !== planTransactions.length - 1 ? "border-b border-outline-variant/10" : ""
                         )}>
                            <div className="flex items-center gap-4">
                               <div className={cn(
                                  "w-12 h-12 rounded-2xl flex items-center justify-center bg-surface-container-high group-hover:scale-110 transition-transform duration-300 shadow-sm",
                                  isExpense ? "opacity-90" : "text-primary opacity-100"
                               )}>
                                  <span className="material-symbols-outlined text-2xl">
                                    {category?.icon || 'help_outline'}
                                  </span>
                               </div>
                               <div>
                                  <h4 className="font-headline font-bold text-base text-on-surface line-clamp-1">{tx.note || category?.name || 'Chưa phân loại'}</h4>
                                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-1 opacity-50 mt-0.5">
                                     <Calendar size={10} /> {tx.date.split('-').reverse().join('/')}
                                  </p>
                               </div>
                            </div>
                            <div className={cn(
                               "font-headline font-black text-base flex flex-col items-end",
                               isExpense ? "text-on-surface" : "text-primary dark:glow"
                            )}>
                               <span className="flex items-center gap-0.5">
                                 {isExpense ? '−' : '+'} {formatCurrency(tx.amount)}<span className="text-[10px] opacity-60 ml-0.5">đ</span>
                               </span>
                               {isExpense && (
                                 <span className="text-[8px] font-black uppercase opacity-30 mt-0.5 tracking-tighter">Giao dịch chi</span>
                               )}
                            </div>
                         </div>
                      )
                   })}
                </div>
             )}
          </div>
          
        </main>
      </div>
    </div>
  )
}

export default BudgetHistoryDetail
