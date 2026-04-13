import { formatCurrency } from '@/utils/format'
import { LoadingScreen } from '@/components/Loading'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Target, Calendar, TrendingUp, AlertTriangle, CheckCircle2, TrendingDown, PiggyBank, Edit3, X, Loader2 } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useActiveBudget, useBudgetMutations, getDailyBudgetStatus } from '../hooks/useBudget'
import { useTransactions } from '../../transactions/hooks/useTransactions'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BudgetPlanner: React.FC = () => {
  const navigate = useNavigate()
  
  const { data: currentPlan, isLoading: planLoading } = useActiveBudget()
  const { data: transactions } = useTransactions()
  const { createBudget, updateBudget, deleteBudget } = useBudgetMutations()

  const [isEditing, setIsEditing] = useState(false)
  const [budgetAmount, setBudgetAmount] = useState<number | string>('')
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState<string>('')

  // Sync state when entering edit mode or new plan mode
  useEffect(() => {
    if (currentPlan) {
      setBudgetAmount(currentPlan.total_budget)
      setStartDate(currentPlan.start_date)
      setEndDate(currentPlan.end_date)
    } else {
      setBudgetAmount('')
      setStartDate(new Date().toISOString().split('T')[0])
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      setEndDate(endOfMonth.toISOString().split('T')[0])
    }
  }, [currentPlan, isEditing])

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(budgetAmount)
    if (amount <= 0) return alert('Vui lòng nhập ngân sách lớn hơn 0')
    if (new Date(startDate) > new Date(endDate)) return alert('Ngày bắt đầu phải trước ngày kết thúc')
    
    if (isEditing && currentPlan) {
      updateBudget.mutate({ id: currentPlan.id, total_budget: amount, start_date: startDate, end_date: endDate }, {
        onSuccess: () => setIsEditing(false)
      })
    } else {
      createBudget.mutate({ total_budget: amount, start_date: startDate, end_date: endDate })
    }
  }

  const handleCancelPlan = () => {
    if(confirm('Bạn có chắc muốn huỷ kế hoạch hiện tại?')) {
       deleteBudget.mutate(currentPlan!.id)
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const todayStatus = (currentPlan && transactions) ? getDailyBudgetStatus(currentPlan, transactions, todayStr) : null

  const progressPercentage = currentPlan && todayStatus
    ? Math.min(100, Math.max(0, (todayStatus.totalSpent / currentPlan.total_budget) * 100))
    : 0

  if (planLoading) {
    return <LoadingScreen message="Đang tải dữ liệu ngân sách..." />
  }

  const isFormView = !currentPlan || isEditing

  return (
    <div className="min-h-screen bg-surface md:p-8">
      <div className="w-full max-w-2xl mx-auto bg-surface relative flex flex-col md:rounded-[3rem] md:shadow-2xl md:min-h-[800px] overflow-hidden">
        
        {/* Header */}
        <header className="sticky top-0 w-full z-20 flex justify-between items-center px-6 h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
          <button 
            type="button"
            onClick={() => {
              if (isEditing) setIsEditing(false)
              else navigate(-1)
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container active:scale-95 transition-all"
          >
            {isEditing ? <X className="w-6 h-6 text-on-surface" /> : <ArrowLeft className="w-6 h-6 text-on-surface" />}
          </button>
          <h1 className="font-headline font-bold text-xl tracking-tight text-primary">Kế hoạch chi tiêu</h1>
          <div className="w-10 h-10 flex items-center justify-center">
            {currentPlan && !isEditing ? (
               <button onClick={() => setIsEditing(true)} className="text-secondary active:scale-95 transition-transform">
                  <Edit3 className="w-5 h-5" />
               </button>
            ) : (
               <Target className="w-6 h-6 text-primary opacity-30" />
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-8 no-scrollbar">
          
          {isFormView ? (
            // ======================
            // SETUP / EDIT BUDGET PLAN
            // ======================
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-primary/5 rounded-3xl p-8 text-center mb-8 border border-primary/10">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PiggyBank className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-headline font-black text-2xl text-on-surface mb-2">Thết lập lớp khiên!</h2>
                <p className="text-on-surface-variant text-sm px-4">Kiểm soát chi tiêu, không lo rỗng túi cuối tháng với công thức Rollover thông minh.</p>
              </div>

              <form onSubmit={handleSavePlan} className="space-y-6">
                <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm">
                  <label className="block font-label text-xs uppercase font-black text-primary opacity-80 mb-4">Tổng ngân sách</label>
                  <div className="flex items-baseline gap-2 border-b-2 border-outline-variant/20 focus-within:border-primary pb-2 transition-colors">
                    <input 
                      type="number"
                      required
                      min="1000"
                      step="1000"
                      value={budgetAmount}
                      onChange={e => setBudgetAmount(e.target.value)}
                      className="bg-transparent border-none text-4xl font-headline font-black text-on-surface focus:ring-0 w-full p-0"
                      placeholder="0"
                    />
                    <span className="text-xl font-headline text-on-surface-variant font-bold">đ</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/10 shadow-sm">
                    <label className="block font-label text-[10px] uppercase font-black text-outline opacity-70 mb-2">Từ ngày</label>
                    <input 
                      type="date"
                      required
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="bg-transparent border-none p-0 text-sm font-bold text-on-surface focus:ring-0 w-full"
                    />
                  </div>
                  <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/10 shadow-sm">
                    <label className="block font-label text-[10px] uppercase font-black text-outline opacity-70 mb-2">Đến ngày</label>
                    <input 
                      type="date"
                      required
                      min={startDate}
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="bg-transparent border-none p-0 text-sm font-bold text-on-surface focus:ring-0 w-full"
                    />
                  </div>
                </div>

                {/* Quick Date Presets */}
                <div className="flex gap-2 justify-center overflow-x-auto no-scrollbar pb-1">
                   {[7, 14, 30].map(days => (
                      <button
                         key={days}
                         type="button"
                         onClick={() => {
                            const end = new Date(startDate)
                            end.setDate(end.getDate() + days - 1)
                            setEndDate(end.toISOString().split('T')[0])
                         }}
                         className="px-4 py-2 rounded-full border border-outline-variant/20 text-xs font-bold text-on-surface-variant hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors whitespace-nowrap flex-shrink-0"
                      >
                         + {days} ngày
                      </button>
                   ))}
                </div>

                <button 
                  type="submit"
                  disabled={createBudget.isPending || updateBudget.isPending}
                  className="w-full bg-primary text-on-primary h-14 rounded-[1.5rem] font-headline font-black text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all mt-8 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {(createBudget.isPending || updateBudget.isPending) && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isEditing ? 'Lưu thay đổi' : 'Bắt đầu kế hoạch'}
                </button>
              </form>
            </div>
          ) : (
            // ======================
            // ACTIVE BUDGET DASHBOARD
            // ======================
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              
              {todayStatus?.budgetEmpty ? (
                <div className="bg-error/10 border border-error/20 rounded-3xl p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mb-4 text-error">
                    <AlertTriangle size={32} />
                  </div>
                  <h3 className="font-headline font-black text-xl text-error mb-2">Đã hết ngân sách!</h3>
                  <p className="text-on-surface-variant text-sm mb-6">Bạn đã tiêu sạch số tiền kế hoạch của kỳ này. Tính năng thêm chi tiêu đang bị khoá.</p>
                  <button onClick={handleCancelPlan} className="bg-error text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-error/30 active:scale-95 transition-transform">
                    {deleteBudget.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Làm lại kế hoạch'}
                  </button>
                </div>
              ) : (
                <>
                  {/* OVERVIEW WIDGET */}
                  <div className="bg-primary text-on-primary rounded-[2.5rem] p-6 relative overflow-hidden shadow-2xl shadow-primary/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="font-label text-xs uppercase tracking-wider font-bold opacity-80 mb-1">Tổng còn lại</p>
                          <h2 className="font-headline font-black text-4xl">
                            {formatCurrency(todayStatus?.remainingTotal)} đ
                          </h2>
                          <p className="text-xs opacity-80 mt-1">/ {formatCurrency(currentPlan.total_budget)} đ ngân sách</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-2 mb-4">
                        <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                          <div 
                            className={cn("h-full rounded-full transition-all duration-1000", progressPercentage > 90 ? "bg-red-400" : "bg-white")} 
                            style={{ width: `${progressPercentage}%` }} 
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold opacity-80">
                          <span>Đã tiêu {formatCurrency(todayStatus?.totalSpent)} đ</span>
                          <span>{progressPercentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DAILY BUDGET WIDGET */}
                  <div className={cn(
                    "rounded-3xl p-6 border shadow-sm transition-all",
                    todayStatus?.isExceeded ? "bg-error/5 border-error/20" : "bg-surface-container-lowest border-outline-variant/10"
                  )}>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl", todayStatus?.isExceeded ? "bg-error/20 text-error" : "bg-secondary/20 text-secondary")}>
                          {todayStatus?.isExceeded ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                        </div>
                        <h3 className="font-headline font-bold text-lg text-on-surface">Ngân sách hôm nay</h3>
                      </div>
                      <span className="bg-surface-container-high px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant flex items-center gap-1">
                        <Calendar size={12} /> {todayStr}
                      </span>
                    </div>

                    <div className="flex flex-col items-center text-center py-4">
                      <p className="text-sm font-bold text-on-surface-variant mb-1">Hạn mức tối đa</p>
                      <h4 className={cn("font-headline font-black text-4xl mb-4", todayStatus?.isExceeded ? "text-error" : "text-primary")}>
                        {formatCurrency(todayStatus?.remainingDaily)} đ
                      </h4>

                      {todayStatus?.isExceeded ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-error bg-error/10 px-4 py-2 rounded-full">
                          <AlertTriangle size={14} /> Bạn đã chi lố hạn mức hôm nay!
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[11px] font-bold text-secondary bg-secondary/10 px-3 py-2 rounded-full">
                          <CheckCircle2 size={14} /> Tốt lắm, hãy giữ vững phong độ nhé!
                        </div>
                      )}
                    </div>

                    {/* ROLLOVER EXPLANATION */}
                    <div className="mt-4 pt-4 border-t border-outline-variant/10">
                      <p className="text-[11px] text-on-surface-variant leading-relaxed font-medium">
                        💡 <strong className="text-on-surface">Công thức Rollover:</strong> Số dư hạn mức ngân sách ngày hôm nay sẽ tự động được cộng dồn và chia đều cho những ngày còn lại!
                      </p>
                    </div>
                  </div>

                  {/* ACTIVE CONFIG */}
                  <div className="flex justify-between items-center px-4 py-2 opacity-50">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      Kỳ: {currentPlan.start_date.slice(5)} tới {currentPlan.end_date.slice(5)}
                    </p>
                    <button onClick={handleCancelPlan} disabled={deleteBudget.isPending} className="text-xs font-bold text-error hover:underline flex items-center gap-1">
                      {deleteBudget.isPending && <Loader2 className="w-3 h-3 animate-spin"/>} Xoá kế hoạch
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default BudgetPlanner
