import { formatCurrency } from '@/utils/format'
import { LoadingScreen } from '@/components/Loading'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Inbox,
  Calendar,
  Wallet,
  Settings2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useTransactions, getTransactionStats } from '../features/transactions/hooks/useTransactions'
import { useCategories } from '../features/categories/hooks/useCategories'
import CategoryDetailModal from '../components/CategoryDetailModal'
import { type Category } from '../features/categories/types/category.schema'
import { TRANSACTION_TYPES_METADATA, type TransactionType } from '../types/transaction.types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const Stats: React.FC = () => {
  const navigate = useNavigate()
  const { data: transactions, isLoading: txLoading } = useTransactions()
  const { data: categories, isLoading: catLoading } = useCategories()
  const [selectedModalCategory, setSelectedModalCategory] = useState<Category | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [statsType, setStatsType] = useState<TransactionType>('expense')
  
  const stats = transactions && categories ? getTransactionStats(transactions, categories, selectedDate) : null

  const handleCategoryClick = (categoryId: string) => {
    const category = categories?.find((cat) => cat.id === categoryId)
    if (category) {
      setSelectedModalCategory(category)
      setIsModalOpen(true)
    }
  }

  const handleEditCategories = () => {
    navigate('/settings/categories')
  }

  const handlePrevMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleResetDate = () => {
    setSelectedDate(new Date())
  }

  // 📊 Tạo danh sách các danh mục theo loại (Chi tiêu hoặc Thu nhập)
  const filteredCategories = categories?.filter(cat => cat.type === statsType) || []

  const allCategoriesWithData = filteredCategories.map((cat) => {
    let categoryStats;
    if (statsType === 'expense') categoryStats = stats?.topCategories?.find((sc) => sc.id === cat.id);
    else if (statsType === 'income') categoryStats = stats?.topIncomeCategories?.find((sc) => sc.id === cat.id);
    else if (statsType === 'borrow') categoryStats = stats?.topBorrowCategories?.find((sc) => sc.id === cat.id);
    else if (statsType === 'lend') categoryStats = stats?.topLendCategories?.find((sc) => sc.id === cat.id);
    else if (statsType === 'business') categoryStats = stats?.topBusinessCategories?.find((sc) => sc.id === cat.id);

    return {
      ...cat,
      amount: categoryStats?.amount || 0,
      count: categoryStats?.count || 0,
      color: categoryStats?.color || cat.color || (TRANSACTION_TYPES_METADATA[statsType]?.color.replace('text-', 'bg-') + '/10' || 'bg-primary/10'),
      icon: cat.icon || 'payments',
    }
  })

  if (txLoading || catLoading) {
    return <LoadingScreen message="Đang phân tích thống kê..." />
  }

  // 📈 Budget Calculations
  const now = new Date()
  const isCurrentMonth = selectedDate.getMonth() === now.getMonth() && selectedDate.getFullYear() === now.getFullYear()
  
  const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()
  const daysLeft = isCurrentMonth ? (lastDay - now.getDate() + 1) : 0
  
  const totalBudget = allCategoriesWithData.reduce((acc, cat) => acc + (cat.limit || 0), 0) || 10000000 // Default 10M
  
  let displayTotal = 0;
  if (statsType === 'expense') displayTotal = stats?.totalExpense || 0;
  else if (statsType === 'income') displayTotal = stats?.totalIncome || 0;
  else if (statsType === 'borrow') displayTotal = stats?.totalBorrow || 0;
  else if (statsType === 'lend') displayTotal = stats?.totalLend || 0;
  else if (statsType === 'business') displayTotal = stats?.businessStats?.profit || 0;

  const progress = Math.min((displayTotal / totalBudget) * 100, 100)
  const remainingBudget = Math.max(totalBudget - displayTotal, 0)
  const dailyLimit = daysLeft > 0 ? (remainingBudget / daysLeft) : 0

  return (
    <div className="w-full pt-4 pb-24 scrollbar-hide px-2 md:px-8 max-w-[1400px] mx-auto">
      
      {/* 🏔️ Header */}
      <section className="mb-6 flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant/10 shadow-sm dark:shadow-dark">
              <span className="material-symbols-outlined text-primary dark:glow">analytics</span>
           </div>
           <h2 className="font-headline font-black text-2xl text-on-surface tracking-tight leading-none italic dark:glow">PocketFlow Budget</h2>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container text-primary hover:bg-surface-container-high transition-all shadow-sm dark:shadow-dark">
           <span className="material-symbols-outlined dark:glow">notifications</span>
        </button>
      </section>

      {/* 🗓️ Month Selector */}
      <section className="mb-8 bg-surface-container-low p-5 rounded-[2.5rem] border border-outline-variant/10 shadow-sm dark:shadow-dark flex items-center justify-between mx-2">
          <button 
            onClick={handlePrevMonth}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-high transition-all shadow-sm active:scale-90"
          >
            <ChevronLeft size={20} className="text-on-surface-variant" />
          </button>

          <div 
            onClick={handleResetDate}
            className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
          >
              <div className="flex items-center gap-2 mb-0.5">
                <Calendar size={14} className="text-primary dark:glow" />
                <span className="font-label text-[10px] font-black uppercase tracking-[0.2em] text-primary dark:text-primary-container opacity-60">
                  {selectedDate.getFullYear()}
                </span>
              </div>
              <h3 className="font-headline font-black text-xl text-on-surface tracking-tight uppercase italic dark:glow">
                Tháng {selectedDate.getMonth() + 1}
              </h3>
          </div>

          <button 
            onClick={handleNextMonth}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-high transition-all shadow-sm active:scale-90"
          >
            <ChevronRight size={20} className="text-on-surface-variant" />
          </button>
      </section>

      {/* 🚀 Stats Type Toggle */}
      <section className="mb-8 px-2 overflow-x-auto no-scrollbar">
        <div className="bg-surface-container-low p-1.5 rounded-[2rem] border border-outline-variant/10 shadow-inner flex gap-2 dark:shadow-dark min-w-max">
          {(['expense', 'income', 'borrow', 'lend'] as const).map(typeKey => {
            const meta = TRANSACTION_TYPES_METADATA[typeKey];
            const isActive = statsType === typeKey;
            
            return (
              <button 
                key={typeKey}
                onClick={() => setStatsType(typeKey)}
                className={cn(
                  "px-6 py-4 rounded-[1.5rem] font-headline font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all",
                  isActive 
                    ? `${meta.badge.split(' ')[0]} ${meta.color} shadow-lg dark:shadow-glow-primary` 
                    : "text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </section>

      {!stats || stats.thisMonthCount === 0 ? (
        <div className="max-w-lg mx-auto py-20 px-6 text-center space-y-8">
          <div className="w-24 h-24 bg-surface-container-high rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner border border-outline-variant/10">
             <Inbox className="w-10 h-10 text-outline-variant" />
          </div>
          <div className="space-y-2">
            <h2 className="font-headline font-black text-2xl text-on-surface">Không có dữ liệu chi tiêu</h2>
            <p className="text-on-surface-variant font-medium opacity-70 leading-relaxed px-4 text-sm">
              Tháng {selectedDate.getMonth() + 1} năm {selectedDate.getFullYear()} chưa có giao dịch nào.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* 💳 Monthly Budget Hero Card */}
          <section className="mb-8">
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-primary-container text-on-primary shadow-[0_24px_48px_rgba(0,93,167,0.2)] dark:shadow-glow-primary relative overflow-hidden group border border-white/10">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-3xl transform group-hover:scale-125 transition-transform duration-1000"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <p className="font-label text-xs uppercase tracking-[0.2em] font-black opacity-60 mb-2">
                    Tổng {TRANSACTION_TYPES_METADATA[statsType]?.label.toLowerCase()} tháng này
                  </p>
                  <h1 className="font-headline font-black text-4xl tracking-tighter italic">
                    {formatCurrency(displayTotal)}
                  </h1>
                </div>
                <div className="bg-white/20 dark:bg-black/20 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/20">
                  <span className="font-label text-[10px] font-black uppercase tracking-widest leading-none">
                    {selectedDate.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-4 relative z-10">
                <div className="flex justify-between items-end text-sm">
                  <span className="font-black italic text-xs tracking-wider opacity-90">{Math.round(progress)}% {statsType === 'expense' ? 'ngân sách' : 'mục tiêu'}</span>
                  <span className="opacity-60 text-[10px] uppercase font-black tracking-widest">Mục tiêu: {formatCurrency(totalBudget)}</span>
                </div>
                <div className="h-4 w-full bg-white/20 dark:bg-black/30 rounded-full overflow-hidden p-1">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(255,255,255,0.5)]" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {isCurrentMonth && progress > 80 && (
                <div className="flex items-center gap-3 bg-error-container text-on-error-container dark:bg-error/20 dark:text-error p-4 rounded-2xl relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500 border border-error/10">
                  <AlertCircle size={20} className="flex-shrink-0 animate-pulse" />
                  <p className="text-[11px] font-black tracking-tight leading-tight uppercase italic">
                    Sắp đạt giới hạn tháng. Hãy chi tiêu cẩn thận hơn!
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* 🧩 Bento Grid Insights */}
          <section className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-surface-container-lowest p-6 rounded-[2.5rem] flex flex-col justify-between h-40 shadow-sm border border-outline-variant/10 group hover:shadow-xl dark:shadow-dark hover:shadow-primary/5 transition-all">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary dark:glow transition-transform group-hover:rotate-12 duration-500">
                <Calendar size={20} strokeWidth={3} />
              </div>
              <div>
                <p className="font-label text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40 mb-1">
                  {isCurrentMonth ? 'Thời gian còn lại' : 'Số ngày trong tháng'}
                </p>
                <p className="font-headline font-black text-3xl text-on-surface tracking-tighter italic dark:glow">
                  {isCurrentMonth ? `${daysLeft} Ngày` : `${lastDay} Ngày`}
                </p>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest p-6 rounded-[2.5rem] flex flex-col justify-between h-40 shadow-sm border border-outline-variant/10 group hover:shadow-xl dark:shadow-dark hover:shadow-secondary/5 transition-all">
              <div className="w-10 h-10 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary dark:glow transition-transform group-hover:-rotate-12 duration-500">
                <Wallet size={20} strokeWidth={3} />
              </div>
              <div>
                <p className="font-label text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40 mb-1">
                  {isCurrentMonth ? 'Hạn mức / Ngày' : 'Trung bình / Ngày'}
                </p>
                <p className="font-headline font-black text-2xl text-on-surface tracking-tighter italic dark:glow">
                  {formatCurrency(Math.round(isCurrentMonth ? dailyLimit : (displayTotal / lastDay)))}
                </p>
              </div>
            </div>
          </section>
          
          {/* 📈 Business Net Profit Summary (Grab KD) */}
          {statsType === 'business' && stats?.businessStats && (
            <section className="mb-8 px-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="bg-surface-container-lowest p-8 rounded-[3rem] border border-outline-variant/10 shadow-xl dark:shadow-dark relative overflow-hidden group">
                  <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-8xl">local_taxi</span>
                  </div>
                  
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <p className="font-label text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40 mb-1 italic">Lợi nhuận ròng Grab</p>
                      <h3 className={cn(
                        "font-headline font-black text-3xl tracking-tighter italic",
                        stats.businessStats.profit >= 0 ? "text-secondary dark:glow-secondary" : "text-error dark:glow-error"
                      )}>
                        {stats.businessStats.profit >= 0 ? '+' : ''}{formatCurrency(stats.businessStats.profit)}
                      </h3>
                    </div>
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      stats.businessStats.profit >= 0 ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"
                    )}>
                      {stats.businessStats.profit >= 0 ? 'Có lãi' : 'Đang lỗ'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-container-high p-4 rounded-2xl border border-outline-variant/5">
                       <p className="font-label text-[9px] text-on-surface-variant font-black uppercase tracking-tight opacity-40 mb-1">Tổng doanh thu (+)</p>
                       <p className="font-headline font-black text-lg text-secondary tracking-tighter italic">
                         {formatCurrency(stats.businessStats.income)}
                       </p>
                    </div>
                    <div className="bg-surface-container-high p-4 rounded-2xl border border-outline-variant/5">
                       <p className="font-label text-[9px] text-on-surface-variant font-black uppercase tracking-tight opacity-40 mb-1">Tổng chi phí (-)</p>
                       <p className="font-headline font-black text-lg text-on-surface tracking-tighter italic">
                         {formatCurrency(stats.businessStats.expense)}
                       </p>
                    </div>
                  </div>
               </div>
            </section>
          )}

          {/* 📂 Category Breakdown */}
          <section className="mb-10 px-1">
            <div className="flex justify-between items-center mb-8 px-4">
              <h2 className="font-headline font-black text-xl text-on-surface tracking-tight italic">
                Phân tích theo {TRANSACTION_TYPES_METADATA[statsType]?.label.toLowerCase()}
              </h2>
              <button 
                onClick={handleEditCategories}
                className="text-primary font-label text-[10px] font-black uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-full border border-primary/10 hover:bg-primary hover:text-white transition-all shadow-sm shadow-primary/5"
              >
                Chỉnh sửa
              </button>
            </div>

            <div className="space-y-4">
              {allCategoriesWithData.map((cat) => (
                <div 
                  key={cat.id} 
                  onClick={() => handleCategoryClick(cat.id)}
                  className="bg-surface-container-lowest p-5 rounded-[2.5rem] flex items-center gap-5 shadow-sm dark:shadow-dark border border-outline-variant/5 hover:border-primary/20 transition-all group cursor-pointer hover:shadow-lg"
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex flex-shrink-0 items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500", cat.color)}>
                    <span className="material-symbols-outlined text-2xl text-white">
                      {cat.icon}
                    </span>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="font-headline font-black text-lg text-on-surface tracking-tight leading-none italic">{cat.name}</span>
                      <span className="font-label text-[10px] text-on-surface-variant font-black opacity-60 uppercase tracking-tighter">
                        {formatCurrency(cat.amount)} / {cat.limit ? formatCurrency(cat.limit) : '∞'} 
                      </span>
                    </div>
                    <div className="relative h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "absolute top-0 left-0 h-full rounded-full transition-all duration-1000",
                          cat.color,
                          cat.limit && cat.amount > cat.limit ? "bg-error animate-pulse" : ""
                        )} 
                        style={{ width: `${cat.limit ? Math.min((cat.amount / cat.limit) * 100, 100) : (displayTotal > 0 ? (cat.amount / displayTotal * 100) : 0)}%` }}
                      ></div>
                    </div>
                    {cat.limit && cat.amount > cat.limit && statsType === 'expense' && (
                       <p className="text-[9px] text-error dark:text-error dark:glow font-black uppercase tracking-widest flex items-center gap-1 italic">
                         <AlertCircle size={10} /> Quá ngưỡng { formatCurrency(cat.amount - cat.limit) }
                       </p>
                    )}
                    {cat.limit && cat.amount >= cat.limit && statsType === 'income' && (
                       <p className="text-[9px] text-secondary dark:text-secondary dark:glow font-black uppercase tracking-widest flex items-center gap-1 italic">
                         <span className="material-symbols-outlined text-[12px]">check_circle</span> Đã đạt mục tiêu
                       </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 🚀 Adjust Budget Action */}
          <button 
            onClick={handleEditCategories}
            className="w-full bg-surface-container p-6 rounded-[2.5rem] font-headline font-black text-primary flex items-center justify-center gap-3 hover:bg-surface-container-high hover:shadow-xl dark:shadow-dark transition-all active:scale-95 duration-200 border border-outline-variant/10 group mb-8"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:rotate-180 transition-transform duration-700">
              <Settings2 size={18} strokeWidth={3} className="dark:glow" />
            </div>
            <span className="uppercase tracking-[0.2em] text-[10px] dark:glow">Điều chỉnh hạn mức tổng</span>
          </button>
        </>
      )}

      {/* Modal */}
      <CategoryDetailModal
        category={selectedModalCategory}
        transactions={transactions || []}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
      />
    </div>
  )
}

export default Stats
