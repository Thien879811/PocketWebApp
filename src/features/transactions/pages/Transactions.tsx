import { formatCurrency } from '@/utils/format'
import { LoadingScreen, LoadingSpinner } from '@/components/Loading'
import React, { useState } from 'react'
import { 
  Loader2, 
  Inbox, 
  Search,
  Filter,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../../categories/hooks/useCategories'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const Transactions: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  const { data: transactions, isLoading: txLoading } = useTransactions()
  const { data: categories } = useCategories()

  const filteredTransactions = transactions?.filter(tx => {
    // Filter by Month & Year
    const txDate = new Date(tx.date)
    const isSameMonth = txDate.getMonth() === selectedDate.getMonth() && 
                       txDate.getFullYear() === selectedDate.getFullYear()
    
    if (!isSameMonth) return false

    const cat = categories?.find(c => c.id === tx.category_id)
    const categoryName = cat?.name || (tx.type === 'withdrawal' ? 'Rút tiền' : '')
    const matchesSearch = categoryName.toLowerCase().includes(search.toLowerCase()) || 
                         (tx.note || '').toLowerCase().includes(search.toLowerCase())
    const matchesTypeFilter = filter === 'all' || tx.type === filter
    const matchesCategoryFilter = categoryFilter === 'all' || tx.category_id === categoryFilter
    return matchesSearch && matchesTypeFilter && matchesCategoryFilter
  })

  // Group by date
  const groupedTransactions: Record<string, any[]> = {}
  filteredTransactions?.forEach(tx => {
    const dateStr = new Date(tx.date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
    if (!groupedTransactions[dateStr]) {
      groupedTransactions[dateStr] = []
    }
    groupedTransactions[dateStr].push(tx)
  })

  // Helper to get category info from ID
  const getCategoryName = (categoryId?: string, type?: string) => {
    if (type === 'withdrawal') return 'Rút tiền'
    return categories?.find(c => c.id === categoryId)?.name || 'Chưa phân loại'
  }

  const getCategoryIcon = (categoryId?: string, type?: string) => {
    if (type === 'withdrawal') return 'payments'
    return categories?.find(c => c.id === categoryId)?.icon || 'help_outline'
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

  if (txLoading) {
    return <LoadingScreen message="Đang tải danh sách giao dịch..." />
  }

  return (
    <div className="max-w-lg mx-auto md:max-w-none pt-4 pb-24 scrollbar-hide">
      
      {/* 🏔️ Header Area */}
      <section className="mb-10 px-2 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-white transition-all shadow-sm active:scale-95">
                <ArrowLeft size={20} className="text-primary" />
            </button>
            <div>
               <p className="font-label text-[10px] uppercase font-black text-on-surface-variant opacity-60 tracking-widest hidden md:block">PocketFlow Ledger</p>
               <h2 className="font-headline font-black text-3xl text-on-surface tracking-tight leading-none">Transactions</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setFilter(filter === 'all' ? 'expense' : filter === 'expense' ? 'income' : 'all')}
               className={cn(
                 "flex items-center gap-2 px-5 py-2.5 rounded-2xl font-label font-black text-[10px] uppercase tracking-widest transition-all border",
                 filter === 'all' ? "bg-surface-container-high text-on-surface-variant border-outline-variant/10 shadow-sm" : "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20 scale-105"
               )}
             >
               <Filter size={14} strokeWidth={3} />
               {filter === 'all' ? 'Tất cả' : filter === 'expense' ? 'Chi tiêu' : 'Thu nhập'}
             </button>
          </div>
        </div>

        {/* 🗓️ Month Selector */}
        <div className="bg-surface-container-low p-5 rounded-[2.5rem] border border-outline-variant/10 shadow-sm flex items-center justify-between">
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
        </div>

        {/* 🔍 Search Bar */}
        <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant opacity-40 group-focus-within:opacity-100 transition-opacity" />
            <input 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search by category, note..."
               className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-[2rem] py-5 pl-14 pr-6 text-on-surface font-label font-bold text-sm focus:ring-4 focus:ring-primary/10 transition-all shadow-xl shadow-on-surface/[0.02]"
            />
        </div>

        {/* 📋 Category Filter */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setCategoryFilter('all')}
            className={cn(
              "px-4 py-2 rounded-full font-label font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border",
              categoryFilter === 'all'
                ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20"
                : "bg-surface-container-high text-on-surface-variant border-outline-variant/10 hover:bg-white"
            )}
          >
            Tất cả
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                "px-4 py-2 rounded-full font-label font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border flex items-center gap-2",
                categoryFilter === cat.id
                  ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20"
                  : "bg-surface-container-high text-on-surface-variant border-outline-variant/10 hover:bg-white"
              )}
            >
              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* 📂 Transaction Groups */}
      <section className="space-y-12 px-2">
         {Object.entries(groupedTransactions).length === 0 ? (
            <div className="bg-surface-container-low rounded-[3rem] p-16 text-center border-2 border-dashed border-outline-variant/30 space-y-4">
               <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto opacity-40">
                  <Inbox className="w-10 h-10" />
               </div>
               <p className="text-on-surface-variant font-black text-sm uppercase opacity-40 tracking-widest leading-relaxed">
                 No transactions <br /> matches found
               </p>
               <button 
                 onClick={() => { setSearch(''); setFilter('all'); setCategoryFilter('all'); }}
                 className="text-primary font-black text-xs uppercase tracking-tighter hover:underline"
               >
                 Clear all filters
               </button>
            </div>
         ) : (
            Object.entries(groupedTransactions).map(([date, items]) => (
               <div key={date} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center justify-between px-4">
                     <h3 className="font-headline font-black text-xs text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">{date}</h3>
                     <div className="h-[1px] flex-1 bg-outline-variant/10 ml-6"></div>
                  </div>
                  
                  <div className="bg-surface-container-lowest rounded-[3rem] overflow-hidden border border-outline-variant/10 shadow-xl shadow-on-surface/[0.02]">
                     {items.map((tx) => (
                        <div 
                           key={tx.id} 
                           onClick={() => navigate(`/edit/${tx.id}`)}
                           className="p-6 flex items-center justify-between group active:bg-primary/5 cursor-pointer transition-all duration-300 border-b border-outline-variant/10 last:border-0"
                        >
                           <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex flex-shrink-0 items-center justify-center shadow-inner group-hover:bg-white transition-all transform group-hover:rotate-6 duration-300">
                                 <span className="material-symbols-outlined text-2xl text-primary opacity-70">
                                   {getCategoryIcon(tx.category_id, tx.type)}
                                 </span>
                              </div>
                              <div className="overflow-hidden">
                                 <p className="font-headline font-black text-lg text-on-surface leading-none mb-1.5 truncate group-hover:text-primary transition-colors">
                                   {getCategoryName(tx.category_id, tx.type)}
                                 </p>
                                 <p className="font-label text-[10px] text-on-surface-variant font-black truncate w-40 opacity-50 uppercase tracking-tighter leading-none">
                                    {tx.note || (tx.type === 'income' ? 'Thu nhập' : tx.type === 'expense' ? 'Chi tiêu' : 'Rút tiền mặt')}
                                 </p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className={cn(
                                 "font-headline font-black text-xl italic tracking-tighter transition-all group-hover:scale-110",
                                 tx.type === 'income' ? "text-secondary" : tx.type === 'expense' ? "text-on-surface" : "text-amber-600"
                              )}>
                                 {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}đ
                              </p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            ))
         )}
      </section>

    </div>
  )
}

export default Transactions
