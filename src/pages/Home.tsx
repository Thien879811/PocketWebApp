import { formatCurrency } from '@/utils/format'
import { LoadingScreen } from '@/components/Loading'
import React, { useState } from 'react'
import { 
  Plus, 
  ChevronRight, 
  Inbox, 
  ArrowUpRight, 
  ArrowDownLeft, 
  LayoutGrid,
  Target
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useTransactions, getTransactionStats } from '../features/transactions/hooks/useTransactions'
import { useAccounts } from '../features/accounts/hooks/useAccounts'
import { useCategories } from '../features/categories/hooks/useCategories'
import { MonthSelector } from '@/components/MonthSelector'
import { SpendingChart } from '@/components/SpendingChart'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  const { data: transactions, isLoading: txLoading } = useTransactions()
  const { data: accounts, isLoading: accLoading } = useAccounts()
  const { data: categories } = useCategories()
  
  const stats = transactions ? getTransactionStats(transactions, categories || [], selectedDate) : null
  const totalBalance = accounts?.reduce((acc, curr) => acc + (curr.balance || 0), 0) || 0

  if (txLoading || accLoading) {
    return <LoadingScreen message="Đang tải dữ liệu tổng quan..." />
  }

  return (
    <div className="max-w-lg mx-auto md:max-w-none pt-4 pb-24 scrollbar-hide space-y-8">
      
      {/* 🏔️ Header Profile Area */}
      <HeaderSection />

      {/* 🗓️ Month Selector */}
      <MonthSelector 
        selectedDate={selectedDate} 
        onDateChange={setSelectedDate} 
      />

      {/* 💳 Net Worth & Summary Card */}
      <BalanceHero 
        balance={totalBalance} 
        income={stats?.totalIncome || 0} 
        expense={stats?.totalExpense || 0} 
      />

      {/* 📈 Insight Chart */}
      {stats && stats.totalExpense > 0 && (
         <SpendingChart data={stats.weeklyTrends} totalSpent={stats.totalExpense} />
      )}

      {/* 🎯 Dashboard Shortcuts */}
      <ShortcutsSection onNavigate={navigate} />

      {/* 📂 Recent Activity Section */}
      <ActivitySection 
        transactions={transactions || []} 
        categories={categories || []} 
        selectedDate={selectedDate} 
        onNavigate={navigate} 
      />

      {/* 🚀 Mobile FAB */}
      <div className="md:hidden fixed bottom-28 right-6 z-40">
        <Link 
           to="/add" 
           className="w-16 h-16 bg-primary text-on-primary rounded-[1.5rem] shadow-2xl flex items-center justify-center active:scale-95 transition-all border-4 border-surface-container shadow-primary/30"
        >
           <Plus size={32} strokeWidth={3} />
        </Link>
      </div>

    </div>
  )
}

const HeaderSection = () => (
  <section className="px-2 flex justify-between items-center">
     <div>
        <p className="font-label text-xs uppercase tracking-[0.2em] font-black text-on-surface-variant opacity-60 mb-2">Xin chào</p>
        <h2 className="font-headline font-black text-3xl text-on-surface tracking-tight leading-none italic">Chào buổi sáng!</h2>
     </div>
     <div className="w-14 h-14 rounded-[1.5rem] bg-surface-container-high border-4 border-surface shadow-xl overflow-hidden active:scale-95 transition-all">
        <img 
           alt="User" 
           className="w-full h-full object-cover" 
           src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFZtPLSa9uNH5lsdWsTZc1yZ7wmFZWqTxHZdDnUYWztIZ5z7-rs-NfBzYApuNLpZxKmdtKeRnTNCu3La1bzfWxq3NCAfpuJSlW1i6V3wvhDv0vrJ-wGNPk51afSCNgh30EXyUxAlEGUA638b-2yNgAoXumdNiB-K4wRw3AWtk-HzGLvOEwoysOuJZwzjnLuu58t9x7E7fv6aH4SrLpZhVQENBud62tFDA4ehY4TIKKERF0yfjkk9N1sY7WGYP223s36cahrMos5lc" 
        />
     </div>
  </section>
)

const BalanceHero = ({ balance, income, expense }: { balance: number, income: number, expense: number }) => (
  <section className="px-2">
     <div className="bg-primary p-10 rounded-[3rem] text-on-primary shadow-2xl shadow-primary/30 relative overflow-hidden group">
        <div className="relative z-10 space-y-2">
           <p className="font-label text-xs uppercase tracking-[0.2em] font-black opacity-60">Tổng số dư</p>
           <h3 className="font-headline font-black text-4xl tracking-tighter">
             {formatCurrency(balance)}
           </h3>
           <div className="flex items-center gap-2 mt-4">
              <span className="text-secondary-fixed bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">+240.000đ hôm nay</span>
           </div>
        </div>
        
        <div className="mt-10 grid grid-cols-2 gap-4 relative z-10 pt-8 border-t border-white/10">
           <div className="space-y-1">
              <div className="flex items-center gap-1.5 opacity-60 text-secondary-fixed">
                 <ArrowDownLeft size={16} strokeWidth={3} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Thu nhập</span>
              </div>
              <p className="text-xl font-black italic tracking-tight">{formatCurrency(income) || '0'}</p>
           </div>
           <div className="space-y-1">
              <div className="flex items-center gap-1.5 opacity-60 text-tertiary-fixed">
                 <ArrowUpRight size={16} strokeWidth={3} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Chi tiêu</span>
              </div>
              <p className="text-xl font-black italic tracking-tight">{formatCurrency(expense) || '0'}</p>
           </div>
        </div>

        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-secondary/20 rounded-full blur-[80px] pointer-events-none"></div>
     </div>
  </section>
)

const ShortcutsSection = ({ onNavigate }: { onNavigate: (path: string) => void }) => (
  <section className="px-2 grid grid-cols-2 gap-4">
      <button onClick={() => onNavigate('/budget')} className="bg-surface-container-lowest p-5 rounded-[2rem] border border-outline-variant/10 text-left hover:bg-surface-container-low transition-all active:scale-95 group shadow-sm">
         <div className="w-12 h-12 bg-primary/10 text-primary rounded-[1rem] flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
            <Target size={24} />
         </div>
         <h4 className="font-headline font-black text-lg text-on-surface leading-none mb-1">Kế hoạch<br/>chi tiêu</h4>
         <p className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Ngân sách</p>
      </button>
      
      <button onClick={() => onNavigate('/goals')} className="bg-surface-container-lowest p-5 rounded-[2rem] border border-outline-variant/10 text-left hover:bg-surface-container-low transition-all active:scale-95 group shadow-sm">
         <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-[1rem] flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
            <ArrowUpRight size={24} />
         </div>
         <h4 className="font-headline font-black text-lg text-on-surface leading-none mb-1">Mục tiêu<br/>tích lũy</h4>
         <p className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Saving Goals</p>
      </button>
  </section>
)

const ActivitySection = ({ transactions, categories, selectedDate, onNavigate }: any) => {
  const currentMonth = selectedDate.getMonth()
  const currentYear = selectedDate.getFullYear()
  
  const filteredTransactions = transactions.filter((tx: any) => {
    const d = new Date(tx.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  return (
    <section className="space-y-6 px-2 pb-10">
       <div className="flex justify-between items-center px-4">
          <h3 className="font-headline font-black text-xl text-on-surface">Dòng tiền gần đây</h3>
          <button onClick={() => onNavigate('/stats')} className="text-primary text-xs font-black uppercase tracking-[0.15em] flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
             Chi tiết
             <ChevronRight size={14} />
          </button>
       </div>

       {filteredTransactions.length === 0 ? (
          <div className="bg-surface-container-low rounded-[2.5rem] p-12 text-center border-2 border-dashed border-outline-variant/30 space-y-4">
             <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto opacity-40">
                <Inbox className="w-8 h-8" />
             </div>
             <p className="text-on-surface-variant font-black text-sm uppercase opacity-40 tracking-widest">Không có hoạt động</p>
             <Link to="/add" className="text-primary font-black text-xs uppercase tracking-tighter hover:underline">Thêm giao dịch đầu tiên</Link>
          </div>
       ) : (
          <div className="bg-surface-container-lowest rounded-[3rem] overflow-hidden border border-outline-variant/10 shadow-xl shadow-on-surface/[0.02]">
              {filteredTransactions.slice(0, 5).map((tx: any) => (
                <div 
                  key={tx.id} 
                  onClick={() => onNavigate(`/edit/${tx.id}`)}
                  className="p-6 flex items-center justify-between group active:bg-primary/5 cursor-pointer transition-all duration-300 border-b border-outline-variant/10 last:border-0"
                >
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex flex-shrink-0 items-center justify-center shadow-inner group-hover:bg-white transition-all">
                         <LayoutGrid size={24} className="text-primary opacity-60" />
                      </div>
                      <div>
                         <p className="font-headline font-black text-lg text-on-surface leading-none mb-1.5">
                            {categories?.find((c: any) => c.id === tx.category_id)?.name || 'Unknown'}
                         </p>
                         <p className="font-label text-[10px] text-on-surface-variant font-black uppercase tracking-tighter opacity-50">
                            {new Date(tx.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })} • {tx.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                         </p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className={cn(
                         "font-headline font-black text-xl italic tracking-tighter",
                         tx.type === 'income' ? "text-secondary" : "text-on-surface"
                      )}>
                         {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                   </div>
                </div>
             ))}
          </div>
       )}
    </section>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}

export default Home
