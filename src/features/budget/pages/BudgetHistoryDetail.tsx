import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Calendar, Loader2, Info } from 'lucide-react'
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
    return (
       <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
       </div>
    )
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

  const planTransactions = transactions
    ?.filter(tx => tx.date >= plan.start_date && tx.date <= plan.end_date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || []

  const expenseTransactions = planTransactions.filter(tx => tx.type === 'expense')
  const totalSpent = expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0)
  const isExceeded = totalSpent > plan.total_budget
  const progress = Math.min(100, Math.max(0, (totalSpent / plan.total_budget) * 100))

  return (
    <div className="min-h-screen bg-surface pb-24 md:p-8">
      <div className="w-full max-w-2xl mx-auto bg-surface relative flex flex-col md:rounded-[3rem] md:shadow-2xl min-h-screen md:min-h-[800px] overflow-hidden">
        
        {/* HEADER */}
        <header className="sticky top-0 w-full z-20 flex items-center justify-between px-6 h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
             <button
               onClick={() => navigate(-1)}
               className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-95"
             >
               <ChevronLeft className="w-6 h-6 text-on-surface" />
             </button>
             <h1 className="font-headline font-bold text-lg tracking-tight text-on-surface">Chi tiết kỳ kế hoạch</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-8 no-scrollbar">
          
          {/* SUMMARY CARD */}
          <div className="bg-primary text-on-primary rounded-[2.5rem] p-6 relative overflow-hidden shadow-xl shadow-primary/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-4">
               <div>
                  <p className="font-label text-xs uppercase tracking-wider font-bold opacity-80 mb-1">Thời gian áp dụng</p>
                  <p className="font-headline font-bold text-xl flex items-center gap-2">
                     <Calendar size={18} />
                     {plan.start_date.slice(5)} - {plan.end_date.slice(5)}
                  </p>
               </div>
               
               <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm space-y-3">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Tổng thiết lập ngân sách</p>
                        <p className="font-headline font-black text-2xl">{plan.total_budget.toLocaleString('vi-VN')} đ</p>
                     </div>
                  </div>
                  <div>
                    <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                      <div 
                         className={cn("h-full rounded-full transition-all duration-1000", isExceeded ? "bg-red-400" : "bg-white")} 
                         style={{ width: `${progress}%` }} 
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-bold opacity-90">
                      <span>Đã tiêu {totalSpent.toLocaleString('vi-VN')} đ</span>
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
                <div className="text-center p-8 border border-dashed border-outline-variant/30 rounded-3xl">
                   <p className="text-sm font-bold text-on-surface-variant">Không có chi tiêu nào trong kỳ này.</p>
                </div>
             ) : (
                <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden shadow-sm">
                   {planTransactions.map((tx, idx) => {
                      const category = categories?.find(c => c.id === tx.category_id)
                      const isExpense = tx.type === 'expense'

                      return (
                         <div key={tx.id} className={cn(
                            "p-4 flex items-center justify-between transition-colors",
                            idx !== planTransactions.length - 1 ? "border-b border-outline-variant/10" : ""
                         )}>
                            <div className="flex items-center gap-4">
                               <div className={cn(
                                  "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-surface-container-highest"
                               )}>
                                  {category?.icon || '🛒'}
                               </div>
                               <div>
                                  <h4 className="font-headline font-bold text-base text-on-surface">{tx.note || category?.name || 'Chưa phân loại'}</h4>
                                  <p className="text-xs font-bold text-on-surface-variant flex items-center gap-1 opacity-80">
                                     <Calendar size={10} /> {tx.date}
                                  </p>
                               </div>
                            </div>
                            <div className={cn(
                               "font-headline font-black text-base flex items-center gap-1",
                               isExpense ? "text-on-surface" : "text-primary"
                            )}>
                               {isExpense ? '-' : '+'} {tx.amount.toLocaleString('vi-VN')}đ
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
