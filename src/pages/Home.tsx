import { formatCurrency } from '@/utils/format'
import { cn } from '@/utils/cn'
import { LoadingScreen } from '@/components/Loading'
import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, ChevronRight, Inbox, ArrowUpRight, ArrowDownLeft,
  PiggyBank, TrendingUp, TrendingDown, Trophy, Target,
  BarChart2, Zap, Flame, LayoutGrid
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useTransactions, getTransactionStats } from '../features/transactions/hooks/useTransactions'
import { useAccounts } from '../features/accounts/hooks/useAccounts'
import { useCategories } from '../features/categories/hooks/useCategories'
import { useGoals } from '../features/goals/hooks/useGoals'
import { Chart } from 'primereact/chart'
import { useAuthStore } from '@/store/useAuthStore'
import { TransactionCard } from '@/components/shared/TransactionCard'
import { MonthSelector } from '@/components/MonthSelector'
import {
  staggerContainer,
  fadeUpVariants,
  fabVariants,
  EASE_OUT,
  DURATION,
} from '@/lib/motion'

/* ─── Types ─────────────────────────────────────────────────────── */
interface KPICardProps {
  label: string
  value: string
  icon: React.ReactNode
  iconClass: string
  sub?: string
}

/* ─── Main Page ─────────────────────────────────────────────────── */
const Home: React.FC = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [chartView, setChartView] = useState<'daily' | 'monthly'>('daily')

  const user = useAuthStore((s) => s.user)
  const { data: transactions, isLoading: txLoading } = useTransactions()
  const { data: accounts, isLoading: accLoading } = useAccounts()
  const { data: categories } = useCategories()
  const { data: goals } = useGoals()

  const stats = useMemo(
    () => transactions ? getTransactionStats(transactions, categories || [], selectedDate) : null,
    [transactions, categories, selectedDate]
  )

  const totalBalance = useMemo(
    () => accounts?.reduce((s, a) => s + (a.balance || 0), 0) || 0,
    [accounts]
  )

  const totalIncome  = stats?.totalIncome  || 0
  const totalExpense = stats?.totalExpense || 0
  const savings      = totalIncome - totalExpense
  const savingRate   = totalIncome > 0 ? Math.round((Math.max(savings, 0) / totalIncome) * 100) : 0

  /* ── Insights ── */
  const topCat     = stats?.topCategories[0]
  const topCatPct  = totalExpense > 0 && topCat ? Math.round((topCat.amount / totalExpense) * 100) : 0

  const weekendTotal = useMemo(() => {
    const m = selectedDate.getMonth(), y = selectedDate.getFullYear()
    return (transactions || [])
      .filter(tx => {
        const d = new Date(tx.date)
        const day = d.getDay()
        return tx.type === 'expense' && d.getMonth() === m && d.getFullYear() === y && (day === 0 || day === 6)
      })
      .reduce((s, tx) => s + tx.amount, 0)
  }, [transactions, selectedDate])
  const weekendPct = totalExpense > 0 ? Math.round((weekendTotal / totalExpense) * 100) : 0

  const w3 = stats?.weeklyTrends[2] || 0
  const w4 = stats?.weeklyTrends[3] || 0
  const trendChange = w3 > 0 ? Math.round(((w4 - w3) / w3) * 100) : 0

  const txCount = stats?.thisMonthCount || 0
  const avgPerTx = txCount > 0 ? Math.round(totalExpense / txCount) : 0

  /* ── Goals ── */
  const activeGoal  = goals?.find(g => g.status === 'active')
  const goalPct     = activeGoal ? Math.min((activeGoal.current_amount / activeGoal.target_amount) * 100, 100) : 0

  /* ── Recent transactions ── */
  const recentTx = useMemo(() => {
    const m = selectedDate.getMonth(), y = selectedDate.getFullYear()
    return (transactions || [])
      .filter(tx => { const d = new Date(tx.date); return d.getMonth() === m && d.getFullYear() === y })
      .slice(0, 8)
  }, [transactions, selectedDate])

  /* ── Greeting ── */
  const hour = new Date().getHours()
  const greeting = hour < 6 ? 'Đêm khuya rồi 🌙' : hour < 12 ? 'Chào buổi sáng ☀️' : hour < 18 ? 'Chào buổi chiều 🌤' : 'Chào buổi tối 🌆'
  const firstName = user?.user_metadata?.full_name?.split(' ').pop() || 'Bạn'
  const todayStr  = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })
  const avatarUrl = user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || user?.email || 'U')}&background=3b82f6&color=fff&bold=true&size=128`

  if (txLoading || accLoading) return <LoadingScreen message="Đang tải tổng quan..." />

  /* ── Chart data ── */
  const chartData = stats ? {
    labels: chartView === 'daily'
      ? Array.from({ length: stats.dailyTrends.length }, (_, i) => String(i + 1))
      : ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'],
    datasets: [
      {
        label: 'Chi tiêu',
        data: chartView === 'daily' ? stats.dailyTrends : stats.monthlyTrends,
        fill: true,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.08)',
        tension: 0.4, pointRadius: 0, pointHoverRadius: 4, borderWidth: 2,
      },
      {
        label: 'Thu nhập',
        data: chartView === 'daily' ? stats.dailyIncomeTrends : stats.monthlyIncomeTrends,
        fill: true,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.08)',
        tension: 0.4, pointRadius: 0, pointHoverRadius: 4, borderWidth: 2,
      },
    ],
  } : null

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const, intersect: false,
        callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` }
      }
    },
    scales: {
      x: {
        display: true,
        grid: { display: false }, border: { display: false },
        ticks: { color: 'rgba(71,85,105,0.5)', font: { size: 9, weight: '600' as const }, maxRotation: 0, autoSkip: true, maxTicksLimit: chartView === 'daily' ? 8 : 12 }
      },
      y: { display: false },
    },
    interaction: { mode: 'index' as const, intersect: false },
  }

  return (
    <>
      {/* ── Stagger container drives cascade entrance of each section ── */}
      <motion.div
        className="max-w-xl mx-auto md:max-w-none space-y-5 pb-28"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >

        {/* ── 1. Greeting ──────────────────────────────────── */}
        <motion.div variants={fadeUpVariants} className="flex items-start justify-between pt-1">
          <div>
            <p className="text-xs text-on-surface-variant font-medium">{greeting}</p>
            <h1 className="text-2xl font-headline font-bold text-on-surface mt-0.5 tracking-tight">{firstName}</h1>
            <p className="text-[11px] text-on-surface-variant/50 font-medium mt-0.5 capitalize">{todayStr}</p>
          </div>
          <motion.button
            onClick={() => navigate('/settings')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: DURATION.fast, ease: EASE_OUT }}
            className="mt-0.5"
          >
            <img src={avatarUrl} alt="avatar"
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary/20 shadow-sm" />
          </motion.button>
        </motion.div>

        {/* ── 2. Balance Hero ───────────────────────────────── */}
        <motion.div
          variants={fadeUpVariants}
          className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/25"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#7c3aed]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.14),transparent_65%)]" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -top-4 -right-4 w-28 h-28 bg-white/8 rounded-full" />

          <div className="relative z-10 p-6">
            <div className="flex items-start justify-between mb-2">
              <p className="text-[10px] text-white/55 font-black uppercase tracking-widest">Tổng số dư</p>
              <span className="text-[10px] bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full font-bold text-white/70 border border-white/10">
                {accounts?.length || 0} ví
              </span>
            </div>

            <motion.h2
              className="text-[2.5rem] font-headline font-black tracking-tight leading-none text-white"
              initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.18, duration: DURATION.slow, ease: EASE_OUT }}
            >
              {formatCurrency(totalBalance)}
            </motion.h2>
            <p className="text-xs text-white/35 mt-1 font-medium">đồng Việt Nam</p>

            <div className="mt-5 grid grid-cols-3 gap-3 pt-4 border-t border-white/12">
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <ArrowDownLeft size={11} className="text-emerald-300" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/45">Thu</span>
                </div>
                <p className="text-sm font-bold text-emerald-300 tabular-nums">{formatCurrency(totalIncome)}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <ArrowUpRight size={11} className="text-red-300" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/45">Chi</span>
                </div>
                <p className="text-sm font-bold text-red-300 tabular-nums">{formatCurrency(totalExpense)}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <PiggyBank size={11} className="text-sky-200" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/45">Lưu</span>
                </div>
                <p className={cn('text-sm font-bold tabular-nums', savings >= 0 ? 'text-sky-200' : 'text-red-300')}>
                  {savings < 0 ? '-' : ''}{formatCurrency(Math.abs(savings))}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Month Selector ──────────────────────────────── */}
        <motion.div variants={fadeUpVariants}>
          <MonthSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </motion.div>

        {/* ── 3. KPI Grid ──────────────────────────────────── */}
        <motion.div variants={fadeUpVariants} className="grid grid-cols-2 gap-3">
          <KPICard
            label="Thu nhập" value={formatCurrency(totalIncome)}
            icon={<ArrowDownLeft size={16} />} iconClass="bg-secondary/10 text-secondary"
            sub={`${txCount} giao dịch`}
          />
          <KPICard
            label="Chi tiêu" value={formatCurrency(totalExpense)}
            icon={<ArrowUpRight size={16} />} iconClass="bg-error/10 text-error"
            sub={avgPerTx > 0 ? `TB ${formatCurrency(avgPerTx)}/lần` : undefined}
          />
          <KPICard
            label="Tiết kiệm" value={formatCurrency(Math.max(savings, 0))}
            icon={<PiggyBank size={16} />} iconClass="bg-primary/10 text-primary"
            sub={savings < 0 ? '⚠ Chi vượt thu' : undefined}
          />
          <KPICard
            label="Tỉ lệ tiết kiệm" value={`${savingRate}%`}
            icon={<TrendingUp size={16} />}
            iconClass={savingRate >= 20 ? 'bg-secondary/10 text-secondary' : savingRate >= 10 ? 'bg-amber-500/10 text-amber-500' : 'bg-error/10 text-error'}
            sub={savingRate >= 20 ? 'Tốt 🎉' : savingRate >= 10 ? 'Đạt yêu cầu' : 'Cần cải thiện'}
          />
        </motion.div>

        {/* ── 4. Spending Chart ──────────────────────────────── */}
        {chartData && (
          <motion.div
            variants={fadeUpVariants}
            className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-on-surface">Biểu đồ dòng tiền</h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/70">
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />Chi
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/70">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />Thu
                  </span>
                </div>
              </div>
              <div className="flex bg-surface-container rounded-lg p-0.5 gap-0.5">
                {(['daily', 'monthly'] as const).map(v => (
                  <button key={v} onClick={() => setChartView(v)}
                    className={cn('px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all',
                      chartView === v ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant/60'
                    )}>
                    {v === 'daily' ? 'Theo ngày' : 'Theo tháng'}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-44">
              <Chart type="line" data={chartData} options={chartOptions} />
            </div>
          </motion.div>
        )}

        {/* ── 5. Top 3 Categories ────────────────────────────── */}
        {stats && stats.topCategories.length > 0 && (
          <motion.div
            variants={fadeUpVariants}
            className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Trophy size={15} className="text-amber-500" />
                Top danh mục chi tiêu
              </h3>
              <button onClick={() => navigate('/stats')}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5">
                Xem tất cả <ChevronRight size={13} />
              </button>
            </div>
            <div className="space-y-3">
              {stats.topCategories.slice(0, 3).map((cat, idx) => {
                const medals = ['🥇', '🥈', '🥉']
                const pct = totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100) : 0
                return (
                  <motion.div
                    key={cat.id}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.07, duration: DURATION.normal, ease: EASE_OUT }}
                  >
                    <span className="text-base w-6 flex-shrink-0">{medals[idx]}</span>
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', cat.color)}>
                      <span className="material-symbols-outlined text-[14px] text-white">{cat.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-on-surface truncate">{cat.name}</span>
                        <span className="text-xs font-bold text-on-surface-variant/70 ml-2 flex-shrink-0 tabular-nums">
                          {formatCurrency(cat.amount)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                        <motion.div
                          className={cn('h-full rounded-full', cat.color)}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.2 + idx * 0.07, duration: DURATION.slow, ease: EASE_OUT }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-on-surface-variant/50 w-7 text-right flex-shrink-0">
                      {pct}%
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ── 6. AI Insights ───────────────────────────────────── */}
        {(totalExpense > 0 || totalIncome > 0) && (
          <motion.div variants={fadeUpVariants}>
            <InsightsCard
              savingRate={savingRate}
              savings={savings}
              topCat={topCat}
              topCatPct={topCatPct}
              weekendPct={weekendPct}
              trendChange={trendChange}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
            />
          </motion.div>
        )}

        {/* ── 7. Active Goal ───────────────────────────────────── */}
        {activeGoal && (
          <motion.div variants={fadeUpVariants}>
            <motion.button
              onClick={() => navigate('/goals')}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: DURATION.fast, ease: EASE_OUT }}
              className="w-full bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 shadow-card text-left hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Target size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Mục tiêu đang thực hiện</p>
                    <p className="text-sm font-bold text-on-surface leading-tight">{activeGoal.name}</p>
                  </div>
                </div>
                <span className="text-xs font-black text-primary">{Math.round(goalPct)}%</span>
              </div>
              <div className="h-2 bg-outline-variant/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${goalPct}%` }}
                  transition={{ delay: 0.15, duration: DURATION.slow, ease: EASE_OUT }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[11px] text-on-surface-variant/60 font-medium tabular-nums">
                  {formatCurrency(activeGoal.current_amount)}
                </span>
                <span className="text-[11px] text-on-surface-variant/60 font-medium tabular-nums">
                  {formatCurrency(activeGoal.target_amount)}
                </span>
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* ── 8. Quick Actions ─────────────────────────────────── */}
        <motion.div variants={fadeUpVariants}>
          <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
            <Zap size={15} className="text-primary" />
            Thao tác nhanh
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction icon={<ArrowUpRight size={20} />} iconBg="bg-error/10 text-error" label="Thêm chi tiêu" onClick={() => navigate('/add')} />
            <QuickAction icon={<ArrowDownLeft size={20} />} iconBg="bg-secondary/10 text-secondary" label="Thêm thu nhập" onClick={() => navigate('/add')} />
            <QuickAction icon={<BarChart2 size={20} />} iconBg="bg-primary/10 text-primary" label="Thống kê" onClick={() => navigate('/stats')} />
            <QuickAction icon={<Target size={20} />} iconBg="bg-amber-500/10 text-amber-500" label="Ngân sách" onClick={() => navigate('/budget')} />
          </div>
        </motion.div>

        {/* ── 9. Recent Transactions ───────────────────────────── */}
        <motion.div variants={fadeUpVariants}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <LayoutGrid size={14} className="text-on-surface-variant" />
              Giao dịch gần đây
            </h3>
            <button onClick={() => navigate('/ledger')}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5">
              Xem tất cả <ChevronRight size={13} />
            </button>
          </div>

          {recentTx.length === 0 ? (
            <motion.div
              className="bg-surface-container-lowest rounded-2xl border-2 border-dashed border-outline-variant/30 p-10 text-center space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: DURATION.normal }}
            >
              <div className="w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center mx-auto">
                <Inbox size={22} className="text-on-surface-variant/40" />
              </div>
              <p className="text-sm text-on-surface-variant/60 font-medium">Chưa có giao dịch trong tháng này</p>
              <Link to="/add" className="inline-block text-xs text-primary font-semibold hover:underline">
                Thêm giao dịch đầu tiên →
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {recentTx.map((tx, idx) => (
                <TransactionCard
                  key={tx.id}
                  tx={tx}
                  categories={categories}
                  index={idx}
                  onClick={() => navigate(`/edit/${tx.id}`)}
                  showDate
                />
              ))}
            </div>
          )}
        </motion.div>

      </motion.div>

      {/* ── FAB — springs in after page content ─────────────── */}
      <motion.div
        variants={fabVariants}
        initial="initial"
        animate="animate"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        className="md:hidden fixed bottom-24 right-4 z-40"
      >
        <Link to="/add"
          className="w-14 h-14 bg-primary text-white rounded-2xl shadow-lg shadow-primary/40 flex items-center justify-center">
          <Plus size={26} strokeWidth={2.5} />
        </Link>
      </motion.div>
    </>
  )
}

/* ─── KPI Card ───────────────────────────────────────────────────── */
const KPICard: React.FC<KPICardProps> = ({ label, value, icon, iconClass, sub }) => (
  <motion.div
    className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/20 shadow-card flex flex-col gap-2.5"
    whileHover={{ y: -2, transition: { duration: 0.18, ease: EASE_OUT } }}
    whileTap={{ scale: 0.97 }}
  >
    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', iconClass)}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/55 mb-0.5">{label}</p>
      <p className="text-lg font-headline font-bold text-on-surface leading-tight tabular-nums">{value}</p>
      {sub && <p className="text-[10px] text-on-surface-variant/50 font-semibold mt-0.5">{sub}</p>}
    </div>
  </motion.div>
)

/* ─── Quick Action ───────────────────────────────────────────────── */
const QuickAction = ({
  icon, iconBg, label, onClick,
}: { icon: React.ReactNode; iconBg: string; label: string; onClick: () => void }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ y: -2, transition: { duration: 0.18, ease: EASE_OUT } }}
    whileTap={{ scale: 0.96 }}
    className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/20 text-left shadow-card group"
  >
    <motion.div
      className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', iconBg)}
      whileHover={{ scale: 1.12 }}
      transition={{ duration: 0.18, ease: EASE_OUT }}
    >
      {icon}
    </motion.div>
    <p className="text-sm font-semibold text-on-surface leading-tight">{label}</p>
  </motion.button>
)

/* ─── Insights Card ──────────────────────────────────────────────── */
const InsightsCard = ({
  savingRate, savings, topCat, topCatPct,
  weekendPct, trendChange, totalIncome, totalExpense,
}: {
  savingRate: number
  savings: number
  topCat?: { name: string; amount: number }
  topCatPct: number
  weekendPct: number
  trendChange: number
  totalIncome: number
  totalExpense: number
}) => {
  const insights: { icon: React.ReactNode; text: string; color: string }[] = []

  if (totalIncome > 0 && savings > 0)
    insights.push({ icon: <PiggyBank size={14} />, color: 'text-secondary', text: `Bạn đã tiết kiệm ${savingRate}% thu nhập tháng này. ${savingRate >= 20 ? 'Xuất sắc! 🎉' : savingRate >= 10 ? 'Khá tốt, hãy cố thêm.' : 'Hãy cố gắng tiết kiệm nhiều hơn.'}` })

  if (savings < 0 && totalExpense > 0)
    insights.push({ icon: <ArrowUpRight size={14} />, color: 'text-error', text: `Chi tiêu vượt thu nhập ${formatCurrency(Math.abs(savings))}. Cần kiểm soát chi tiêu ngay.` })

  if (topCat && topCatPct > 0)
    insights.push({ icon: <Flame size={14} />, color: 'text-amber-500', text: `"${topCat.name}" chiếm ${topCatPct}% tổng chi tiêu — danh mục tốn kém nhất tháng này.` })

  if (weekendPct > 0)
    insights.push({ icon: <TrendingUp size={14} />, color: 'text-primary', text: `Chi tiêu cuối tuần chiếm ${weekendPct}% tổng chi tiêu tháng này.` })

  if (trendChange !== 0)
    insights.push({
      icon: trendChange > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />,
      color: trendChange > 0 ? 'text-error' : 'text-secondary',
      text: `Chi tiêu tuần này ${trendChange > 0 ? `tăng ${trendChange}%` : `giảm ${Math.abs(trendChange)}%`} so với tuần trước.`
    })

  if (insights.length === 0) return null

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 shadow-card">
      <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
        <span className="text-base">✨</span>
        Phân tích thông minh
      </h3>
      <div className="space-y-3">
        {insights.slice(0, 4).map((ins, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: DURATION.normal, ease: EASE_OUT }}
          >
            <div className={cn('mt-0.5 flex-shrink-0', ins.color)}>{ins.icon}</div>
            <p className="text-xs text-on-surface-variant/80 font-medium leading-relaxed">{ins.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Home
