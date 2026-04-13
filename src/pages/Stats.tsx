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
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const Stats: React.FC = () => {
  const navigate = useNavigate()
  const { data: transactions, isLoading: txLoading } = useTransactions()
  const { data: categories, isLoading: catLoading } = useCategories()
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  const stats = transactions && categories ? getTransactionStats(transactions, categories, selectedDate) : null

  const handleCategoryClick = (categoryId: string) => {
    const category = categories?.find((cat) => cat.id === categoryId)
    if (category) {
      setSelectedCategory(category)
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

  // 📊 Tạo danh sách tất cả các danh mục với dữ liệu chi tiêu
  const allCategoriesWithData = categories?.map((cat) => {
    const categoryStats = stats?.topCategories.find((sc) => sc.id === cat.id)
    return {
      ...cat,
      amount: categoryStats?.amount || 0,
      count: categoryStats?.count || 0,
      color: categoryStats?.color || cat.color || 'bg-primary/10',
      icon: cat.icon || 'payments',
    }
  }) || []

  if (txLoading || catLoading) {
    return <LoadingScreen message="Đang phân tích thống kê..." />
  }

  // 📈 Budget Calculations
  const now = new Date()
  const isCurrentMonth = selectedDate.getMonth() === now.getMonth() && selectedDate.getFullYear() === now.getFullYear()
  
  const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()
  const daysLeft = isCurrentMonth ? (lastDay - now.getDate() + 1) : 0
  
  const totalBudget = allCategoriesWithData.reduce((acc, cat) => acc + (cat.limit || 0), 0) || 10000000 // Default 10M
  const totalSpent = stats?.totalExpense || 0
  const progress = Math.min((totalSpent / totalBudget) * 100, 100)
  const remainingBudget = Math.max(totalBudget - totalSpent, 0)
  const dailyLimit = daysLeft > 0 ? (remainingBudget / daysLeft) : 0

  return (
    <div className="max-w-lg mx-auto md:max-w-none pt-4 pb-24 scrollbar-hide px-2">
      
      {/* 🏔️ Header */}
      <section className="mb-6 flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden border border-outline-variant/10 shadow-sm">
              <span className="material-symbols-outlined text-primary">analytics</span>
           </div>
           <h2 className="font-headline font-black text-2xl text-on-surface tracking-tight leading-none italic">PocketFlow Budget</h2>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high text-primary hover:bg-white transition-all shadow-sm">
           <span className="material-symbols-outlined">notifications</span>
        </button>
      </section>

      {/* 🗓️ Month Selector */}
      <section className="mb-8 bg-surface-container-low p-5 rounded-[2.5rem] border border-outline-variant/10 shadow-sm flex items-center justify-between mx-2">
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
              <h3 className="font-headline font-black text-xl text-on-surface tracking-tight uppercase">
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
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-container text-white shadow-[0_24px_48px_rgba(0,93,167,0.2)] relative overflow-hidden group">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-3xl transform group-hover:scale-125 transition-transform duration-1000"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <p className="font-label text-xs uppercase tracking-[0.2em] font-black opacity-60 mb-2">Đã chi tiêu tháng này</p>
                  <h1 className="font-headline font-black text-4xl tracking-tighter italic">
                    {formatCurrency(totalSpent)}đ
                  </h1>
                </div>
                <div className="bg-white/20 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/20">
                  <span className="font-label text-[10px] font-black uppercase tracking-widest">
                    {selectedDate.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8 relative z-10">
                <div className="flex justify-between items-end text-sm">
                  <span className="font-black italic text-xs tracking-wider opacity-90">{Math.round(progress)}% ngân sách</span>
                  <span className="opacity-60 text-[10px] uppercase font-black tracking-widest">Mục tiêu: {formatCurrency(totalBudget)}đ</span>
                </div>
                <div className="h-4 w-full bg-white/20 rounded-full overflow-hidden p-1">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(255,255,255,0.5)]" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {isCurrentMonth && progress > 80 && (
                <div className="flex items-center gap-3 bg-secondary-container text-on-secondary-container p-4 rounded-2xl relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
            <div className="bg-surface-container-lowest p-6 rounded-[2.5rem] flex flex-col justify-between h-40 shadow-sm border border-outline-variant/10 group hover:shadow-xl hover:shadow-primary/5 transition-all">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-transform group-hover:rotate-12 duration-500">
                <Calendar size={20} strokeWidth={3} />
              </div>
              <div>
                <p className="font-label text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40 mb-1">
                  {isCurrentMonth ? 'Thời gian còn lại' : 'Số ngày trong tháng'}
                </p>
                <p className="font-headline font-black text-3xl text-on-surface tracking-tighter italic">
                  {isCurrentMonth ? `${daysLeft} Ngày` : `${lastDay} Ngày`}
                </p>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest p-6 rounded-[2.5rem] flex flex-col justify-between h-40 shadow-sm border border-outline-variant/10 group hover:shadow-xl hover:shadow-secondary/5 transition-all">
              <div className="w-10 h-10 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary transition-transform group-hover:-rotate-12 duration-500">
                <Wallet size={20} strokeWidth={3} />
              </div>
              <div>
                <p className="font-label text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40 mb-1">
                  {isCurrentMonth ? 'Hạn mức / Ngày' : 'Trung bình / Ngày'}
                </p>
                <p className="font-headline font-black text-2xl text-on-surface tracking-tighter italic">
                  {formatCurrency(Math.round(isCurrentMonth ? dailyLimit : (totalSpent / lastDay)))}đ
                </p>
              </div>
            </div>
          </section>

          {/* 📂 Category Breakdown */}
          <section className="mb-10 px-1">
            <div className="flex justify-between items-center mb-8 px-4">
              <h2 className="font-headline font-black text-xl text-on-surface tracking-tight italic">Hạn mức danh mục</h2>
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
                  className="bg-surface-container-lowest p-5 rounded-[2.5rem] flex items-center gap-5 shadow-sm border border-outline-variant/5 hover:border-primary/20 transition-all group cursor-pointer hover:shadow-lg"
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
                        {formatCurrency(cat.amount)} / {cat.limit ? formatCurrency(cat.limit) : '∞'} đ
                      </span>
                    </div>
                    <div className="relative h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "absolute top-0 left-0 h-full rounded-full transition-all duration-1000",
                          cat.color,
                          cat.limit && cat.amount > cat.limit ? "bg-error animate-pulse" : ""
                        )} 
                        style={{ width: `${cat.limit ? Math.min((cat.amount / cat.limit) * 100, 100) : (totalSpent > 0 ? (cat.amount / totalSpent * 100) : 0)}%` }}
                      ></div>
                    </div>
                    {cat.limit && cat.amount > cat.limit && (
                       <p className="text-[9px] text-error font-black uppercase tracking-widest flex items-center gap-1 italic">
                         <AlertCircle size={10} /> Quá ngưỡng { formatCurrency(cat.amount - cat.limit) }đ
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
            className="w-full bg-surface-container-high py-6 rounded-[2.5rem] font-headline font-black text-primary flex items-center justify-center gap-3 hover:bg-white hover:shadow-xl transition-all active:scale-95 duration-200 border border-outline-variant/10 group mb-8"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:rotate-180 transition-transform duration-700">
              <Settings2 size={18} strokeWidth={3} />
            </div>
            <span className="uppercase tracking-[0.2em] text-[10px]">Điều chỉnh hạn mức tổng</span>
          </button>
        </>
      )}

      {/* Modal */}
      <CategoryDetailModal
        category={selectedCategory}
        transactions={transactions || []}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
      />
    </div>
  )
}

export default Stats
