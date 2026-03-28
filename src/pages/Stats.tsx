import React from 'react'
import { 
  BarChart3, 
  PieChart as PieIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  BrainCircuit, 
  ChevronRight, 
  Download,
  Loader2,
  Inbox,
  LayoutGrid,
  Sparkles
} from 'lucide-react'
import { useTransactions, getTransactionStats } from '../features/transactions/hooks/useTransactions'

const Stats: React.FC = () => {
  const { data: transactions, isLoading } = useTransactions()
  const stats = transactions ? getTransactionStats(transactions) : null

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" strokeWidth={3} />
        <p className="font-headline font-black text-xl tracking-tight">Đang tải báo cáo...</p>
      </div>
    )
  }

  if (!stats || stats.thisMonthCount === 0) {
    return (
      <div className="max-w-lg mx-auto py-20 px-6 text-center space-y-8">
        <div className="w-24 h-24 bg-surface-container-high rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-outline-variant/10">
           <Inbox className="w-10 h-10 text-outline-variant" />
        </div>
        <div className="space-y-2">
          <h2 className="font-headline font-black text-2xl text-on-surface">Chưa có dữ liệu</h2>
          <p className="text-on-surface-variant font-medium opacity-70 leading-relaxed px-4">
            Hãy thêm ít nhất một giao dịch trong tháng này để mở khóa báo cáo tài chính.
          </p>
        </div>
      </div>
    )
  }

  // 📈 Calculation for progress bars
  const maxAmount = Math.max(...stats.topCategories.map(c => c.amount)) || 1
  const maxWeekly = Math.max(...stats.weeklyTrends) || 1

  return (
    <div className="max-w-lg mx-auto md:max-w-none pt-4 pb-24 scrollbar-hide">
      
      {/* 🏔️ Header */}
      <section className="mb-10 px-2 flex justify-between items-end">
        <div>
          <p className="font-label text-xs uppercase tracking-[0.2em] font-black text-on-surface-variant opacity-60 mb-2">Phân tích</p>
          <h2 className="font-headline font-black text-3xl text-on-surface tracking-tight">Báo cáo tài chính</h2>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high text-primary font-label font-black text-xs rounded-2xl active:scale-95 transition-all border border-outline-variant/10 shadow-sm uppercase tracking-wider">
          <Download size={16} />
          Xuất file
        </button>
      </section>

      {/* 📊 Income vs Expense Hero */}
      <section className="grid grid-cols-2 gap-4 px-2 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-[2.5rem] shadow-sm border border-outline-variant/10 space-y-3 relative overflow-hidden group">
          <div className="flex items-center gap-2 text-secondary relative z-10">
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
              <ArrowDownLeft size={18} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Thu nhập</span>
          </div>
          <div className="text-xl font-headline font-black text-on-surface relative z-10">{stats.totalIncome.toLocaleString('vi-VN')}đ</div>
          <div className="text-[10px] text-secondary font-black bg-secondary/5 inline-block px-2 py-0.5 rounded-full border border-secondary/10">+12% tháng này</div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-[2.5rem] shadow-sm border border-outline-variant/10 space-y-3 relative overflow-hidden group">
          <div className="flex items-center gap-2 text-error relative z-10">
            <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center">
              <ArrowUpRight size={18} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Chi tiêu</span>
          </div>
          <div className="text-xl font-headline font-black text-on-surface relative z-10">{stats.totalExpense.toLocaleString('vi-VN')}đ</div>
          <div className="text-[10px] text-error font-black bg-error/5 inline-block px-2 py-0.5 rounded-full border border-error/10">+4% tháng này</div>
        </div>
      </section>

      {/* 📈 Spending Trends Bar Chart */}
      <section className="bg-surface-container-lowest p-8 rounded-[3rem] shadow-sm border border-outline-variant/10 space-y-8 mb-8 mx-2 relative overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="font-headline font-black text-xl text-on-surface">Xu hướng chi tiêu</h3>
          <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.15em] opacity-40 bg-surface-container-high px-3 py-1 rounded-full">Tổng quan tháng {new Date().getMonth() + 1}</span>
        </div>
        
        <div className="h-44 flex items-end justify-between gap-4 px-2 relative z-10">
          {stats.weeklyTrends.map((val, i) => (
            <div key={i} className="flex flex-col items-center gap-3 w-full group">
              <div 
                className={cn(
                  "w-full rounded-2xl transition-all duration-700 relative",
                  val === maxWeekly && val > 0
                    ? "bg-primary shadow-2xl shadow-primary/40" 
                    : "bg-surface-container-highest/60 hover:bg-primary-fixed hover:scale-y-[1.05]"
                )} 
                style={{ height: `${(val / maxWeekly) * 100}%` }}
              >
                {val > 0 && (
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] font-black px-2 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                     {(val/1000000).toFixed(1)}Tr đ
                   </div>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-black tracking-widest",
                val === maxWeekly && val > 0 ? "text-primary" : "text-on-surface-variant opacity-60"
              )}>
                T{i+1}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 🧩 Breakdown Bento Grid */}
      <section className="grid grid-cols-2 gap-4 px-2 mb-8">
        {/* Pie Chart Representation */}
        <div className="bg-primary p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-on-primary space-y-5 shadow-2xl shadow-primary/20 relative overflow-hidden group">
          <div className="relative w-32 h-32 transform transition-transform duration-700 group-hover:rotate-12">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" className="text-white/10" stroke="currentColor" strokeWidth="3.5" />
              <circle 
                cx="18" cy="18" r="16" fill="none" 
                className="text-white shadow-xl" 
                stroke="currentColor" strokeWidth="3.5" 
                strokeDasharray="100, 100" strokeDashoffset={100 - (stats.totalIncome > 0 ? (stats.totalIncome / (stats.totalIncome + stats.totalExpense) * 100) : 50)}
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black">
                {Math.round(stats.totalIncome / (stats.totalIncome + stats.totalExpense || 1) * 100)}%
              </span>
              <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Số dư</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Chi nhiều nhất</p>
            <h4 className="font-headline font-black text-lg tracking-tight leading-none italic truncate w-32">
              {stats.topCategories[0]?.name || 'Chưa định nghĩa'}
            </h4>
          </div>
        </div>

        {/* ✨ AI Smart Insight Card */}
        <div className="bg-surface-container-highest/20 backdrop-blur-2xl p-6 rounded-[2.5rem] space-y-4 flex flex-col justify-between border border-white/30 shadow-sm relative overflow-hidden">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-primary/10">
            <BrainCircuit className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-sm font-black text-on-surface uppercase tracking-tighter mb-1.5 flex items-center gap-2">
              Gợi ý thông minh
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
            </p>
            <p className="text-[11px] leading-relaxed text-on-surface-variant font-semibold italic opacity-90">
              "Đã ghi nhận {stats.thisMonthCount} giao dịch tháng này. Bạn chi nhiều nhất cho <b>{stats.topCategories[0]?.name}</b>."
            </p>
          </div>
        </div>
      </section>

      {/* 🏆 Top Spending Categories List */}
      <section className="space-y-6 px-2">
        <div className="flex justify-between items-center px-4">
          <h3 className="font-headline font-black text-xl text-on-surface">Top danh mục</h3>
          <button className="text-primary text-xs font-black uppercase tracking-widest flex items-center gap-1">
             Chi tiết
             <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="bg-surface-container-lowest rounded-[3rem] overflow-hidden border border-outline-variant/10 shadow-xl shadow-on-surface/[0.02]">
          {stats.topCategories.slice(0, 5).map((cat, i) => (
            <div key={i} className={cn(
              "p-6 flex items-center justify-between group transition-all duration-300",
              i % 2 !== 0 ? "bg-surface-container-low/30" : "bg-transparent"
            )}>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-highest/40 flex items-center justify-center shadow-inner">
                   <LayoutGrid size={24} className="text-primary opacity-60" />
                </div>
                <div>
                  <p className="font-headline font-black text-lg text-on-surface leading-none mb-1">{cat.name}</p>
                  <p className="font-label text-xs text-on-surface-variant font-black opacity-50 uppercase tracking-tighter">{cat.count} giao dịch</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-headline font-black text-lg text-on-surface mb-2">{cat.amount.toLocaleString('vi-VN')}đ</p>
                <div className="h-1.5 w-24 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${(cat.amount / maxAmount) * 100}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}

export default Stats
