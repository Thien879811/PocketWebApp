import { formatCurrency } from '@/utils/format'
import { LoadingScreen } from '@/components/Loading'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, History, Calendar, Target, CheckCircle2, TrendingUp } from 'lucide-react'
import { useBudgetHistory } from '../hooks/useBudget'
import { useTransactions } from '../../transactions/hooks/useTransactions'
import { useCategories } from '../../categories/hooks/useCategories'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BudgetHistory: React.FC = () => {
  const navigate = useNavigate()
  
  const { data: plans, isLoading: plansLoading } = useBudgetHistory()
  const { data: transactions, isLoading: txLoading } = useTransactions()
  const { data: categories, isLoading: catLoading } = useCategories()

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

  if (plansLoading || txLoading || catLoading) {
     return <LoadingScreen message="Đang tải lịch sử ngân sách..." />
  }

  return (
    <div className="min-h-screen bg-surface pb-24 md:p-8">
      <div className="w-full max-w-2xl mx-auto bg-surface relative flex flex-col md:rounded-[3rem] md:shadow-2xl md:min-h-[800px] overflow-hidden">
        
        {/* 🏔️ Header */}
        <header className="sticky top-0 w-full z-20 flex items-center gap-4 px-6 h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 text-on-surface" />
          </button>
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant font-bold opacity-60">Settings</p>
            <h1 className="font-headline font-bold text-xl tracking-tight text-on-surface flex items-center gap-2">
              Lịch sử kế hoạch ngân sách
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 no-scrollbar">
           {!plans || plans.length === 0 ? (
              <div className="bg-surface-container-low rounded-[2.5rem] p-12 text-center border-2 border-dashed border-outline-variant/30 space-y-4">
                 <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto opacity-40">
                    <History className="w-8 h-8" />
                 </div>
                 <p className="text-on-surface-variant font-black text-sm uppercase opacity-40 tracking-widest">Chưa có dữ liệu</p>
              </div>
           ) : (
              <div className="space-y-4">
                 {plans.map((plan, index) => {
                    const planTransactions = filteredTransactions?.filter(tx => 
                       tx.type === 'expense' && 
                       tx.date >= plan.start_date && 
                       tx.date <= plan.end_date
                    ) || []

                    const totalSpent = planTransactions.reduce((acc, curr) => acc + curr.amount, 0)
                    const isExceeded = totalSpent > plan.total_budget
                    const progress = Math.min(100, Math.max(0, (totalSpent / plan.total_budget) * 100))
                    
                    const isLatest = index === 0;

                    return (
                       <div key={plan.id} onClick={() => navigate(`/settings/budget-history/${plan.id}`)} className={cn(
                          "bg-surface-container-lowest p-6 rounded-3xl border shadow-sm transition-all relative overflow-hidden cursor-pointer hover:bg-surface-container-low active:scale-[0.98]",
                          isLatest ? "border-primary/20 bg-primary/5" : "border-outline-variant/10"
                       )}>
                          {isLatest && <div className="absolute top-0 right-0 bg-primary text-on-primary font-bold text-[10px] uppercase px-3 py-1 rounded-bl-xl tracking-widest">Hiện tại</div>}
                          
                          <div className="flex justify-between items-start mb-4">
                             <div>
                                <h3 className="font-headline font-black text-xl text-on-surface">
                                   {formatCurrency(plan.total_budget)}
                                </h3>
                                <p className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1.5 mt-1 opacity-80 uppercase tracking-wide">
                                   <Calendar size={12} />
                                   {plan.start_date.slice(5)} tới {plan.end_date.slice(5)}
                                </p>
                             </div>
                             <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                isExceeded ? "bg-error/20 text-error" : "bg-secondary/20 text-secondary"
                             )}>
                                {isExceeded ? <TrendingUp size={20} /> : <CheckCircle2 size={20} />}
                             </div>
                          </div>

                          <div className="space-y-2">
                             <div className="h-2.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                               <div 
                                  className={cn("h-full rounded-full", isExceeded ? "bg-error" : "bg-primary")} 
                                  style={{ width: `${progress}%` }} 
                               />
                             </div>
                             <div className="flex justify-between items-center text-[11px] font-bold">
                                <span className={cn(isExceeded ? "text-error" : "text-on-surface-variant")}>
                                   Đã tiêu: {formatCurrency(totalSpent)}
                                </span>
                                <span className={isExceeded ? "text-error" : "text-on-surface"}>
                                   {progress.toFixed(1)}%
                                </span>
                             </div>
                          </div>
                          
                          {isExceeded && (
                             <div className="mt-4 text-[10px] bg-error/10 text-error font-bold px-3 py-2 rounded-xl flex items-center gap-2">
                                <Target size={14} /> Kế hoạch đã bị vượt kì vọng!
                             </div>
                          )}
                       </div>
                    )
                 })}
              </div>
           )}
        </main>
      </div>
    </div>
  )
}

export default BudgetHistory
