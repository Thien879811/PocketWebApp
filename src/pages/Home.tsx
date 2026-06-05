import { formatCurrency } from '@/utils/format'
import { LoadingScreen } from '@/components/Loading'
import React, { useState } from 'react'
import {
  Plus, ChevronRight, Inbox, ArrowUpRight,
  ArrowDownLeft, Target, PiggyBank
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useTransactions, getTransactionStats } from '../features/transactions/hooks/useTransactions'
import { useAccounts } from '../features/accounts/hooks/useAccounts'
import { useCategories } from '../features/categories/hooks/useCategories'
import { MonthSelector } from '@/components/MonthSelector'
import { Chart } from 'primereact/chart'
import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/utils/cn'
import { TransactionCard } from '@/components/shared/TransactionCard'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [chartView, setChartView] = useState<'daily' | 'monthly'>('daily')

  const user = useAuthStore((s) => s.user)
  const { data: transactions, isLoading: txLoading } = useTransactions()
  const { data: accounts, isLoading: accLoading } = useAccounts()
  const { data: categories } = useCategories()

  const stats = transactions
    ? getTransactionStats(transactions, categories || [], selectedDate)
    : null
  const totalBalance = accounts?.reduce((acc, curr) => acc + (curr.balance || 0), 0) || 0

  const avatarUrl = user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.user_metadata?.full_name || user?.email || 'U'
    )}&background=4f6ef7&color=fff&bold=true&size=128`

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Chào buổi sáng' :
    hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  if (txLoading || accLoading) {
    return <LoadingScreen message="Đang tải tổng quan..." />
  }

  return (
    <div className="max-w-xl mx-auto md:max-w-none space-y-5 pb-8">

      {/* ── Header ───────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-on-surface-variant font-medium">{greeting} 👋</p>
          <h1 className="text-2xl font-headline font-bold text-on-surface mt-0.5 tracking-tight">
            {user?.user_metadata?.full_name?.split(' ').pop() || 'Bạn'}
          </h1>
        </div>
        <button onClick={() => navigate('/settings')}>
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-primary/20 active:scale-95 transition-transform"
          />
        </button>
      </div>

      {/* ── Month Selector ───────────────────────── */}
      <MonthSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* ── Balance Hero ─────────────────────────── */}
      <BalanceHero
        balance={totalBalance}
        income={stats?.totalIncome || 0}
        expense={stats?.totalExpense || 0}
      />

      {/* ── Chart ────────────────────────────────── */}
      {stats && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 shadow-card">
          {/* Header row */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-on-surface">
                {chartView === 'daily' ? 'Dòng tiền theo ngày' : 'Dòng tiền theo tháng'}
              </h3>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                  Chi tiêu
                </span>
                <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
                  Thu nhập
                </span>
              </div>
            </div>
            {/* Toggle */}
            <div className="flex bg-surface-container rounded-lg p-0.5 gap-0.5">
              {(['daily', 'monthly'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setChartView(v)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all",
                    chartView === v
                      ? "bg-surface-container-lowest text-on-surface shadow-sm"
                      : "text-on-surface-variant/70"
                  )}
                >
                  {v === 'daily' ? 'Ngày' : 'Tháng'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-44">
            <Chart
              type="line"
              data={{
                labels: chartView === 'daily'
                  ? Array.from({ length: stats.dailyTrends.length }, (_, i) => (i + 1).toString())
                  : ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'],
                datasets: [
                  {
                    label: 'Chi tiêu',
                    data: chartView === 'daily' ? stats.dailyTrends : stats.monthlyTrends,
                    fill: true,
                    borderColor: '#4f6ef7',
                    backgroundColor: 'rgba(79,110,247,0.06)',
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    borderWidth: 2,
                  },
                  {
                    label: 'Thu nhập',
                    data: chartView === 'daily' ? stats.dailyIncomeTrends : stats.monthlyIncomeTrends,
                    fill: true,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.06)',
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                      label: (ctx: any) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`
                    }
                  }
                },
                scales: {
                  x: {
                    display: true,
                    grid: { display: false },
                    border: { display: false },
                    ticks: {
                      color: 'rgba(71,85,105,0.5)',
                      font: { size: 9, weight: '600' },
                      maxRotation: 0,
                      autoSkip: true,
                      maxTicksLimit: chartView === 'daily' ? 8 : 12,
                    }
                  },
                  y: { display: false },
                },
                interaction: { mode: 'index', intersect: false },
              }}
            />
          </div>
        </div>
      )}

      {/* ── Quick Actions ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <ShortcutCard
          icon={<Target size={20} />}
          iconBg="bg-primary/10 text-primary"
          title="Kế hoạch chi tiêu"
          subtitle="Ngân sách"
          onClick={() => navigate('/budget')}
        />
        <ShortcutCard
          icon={<PiggyBank size={20} />}
          iconBg="bg-secondary/10 text-secondary"
          title="Mục tiêu tích lũy"
          subtitle="Tiết kiệm"
          onClick={() => navigate('/goals')}
        />
      </div>

      {/* ── Recent Activity ──────────────────────── */}
      <ActivitySection
        transactions={transactions || []}
        categories={categories || []}
        selectedDate={selectedDate}
        onNavigate={navigate}
      />

      {/* FAB mobile */}
      <div className="md:hidden fixed bottom-24 right-4 z-40">
        <Link
          to="/add"
          className="w-14 h-14 bg-primary text-white rounded-2xl shadow-lg shadow-primary/40 flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={26} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  )
}

/* ─── Sub-components ────────────────────────────────────────────── */

const BalanceHero = ({
  balance, income, expense,
}: {
  balance: number; income: number; expense: number
}) => (
  <div className="bg-gradient-to-br from-primary to-[#3b5cf6] rounded-2xl p-6 text-white relative overflow-hidden shadow-elevated shadow-primary/25">
    {/* Decorative circles */}
    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/8 rounded-full pointer-events-none" />
    <div className="absolute -left-6 -bottom-8 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

    <div className="relative z-10">
      <p className="text-xs text-white/70 font-medium uppercase tracking-wider mb-1">
        Tổng số dư
      </p>
      <h2 className="text-4xl font-headline font-bold tracking-tight leading-none">
        {formatCurrency(balance)}
      </h2>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/15">
        <div>
          <div className="flex items-center gap-1.5 text-white/70 mb-1">
            <ArrowDownLeft size={14} />
            <span className="text-[11px] font-semibold uppercase tracking-wide">Thu nhập</span>
          </div>
          <p className="text-lg font-bold">{formatCurrency(income)}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-white/70 mb-1">
            <ArrowUpRight size={14} />
            <span className="text-[11px] font-semibold uppercase tracking-wide">Chi tiêu</span>
          </div>
          <p className="text-lg font-bold">{formatCurrency(expense)}</p>
        </div>
      </div>
    </div>
  </div>
)

const ShortcutCard = ({
  icon, iconBg, title, subtitle, onClick,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  subtitle: string
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/20 text-left hover:border-primary/30 hover:shadow-card transition-all active:scale-[0.97] shadow-card group"
  >
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110", iconBg)}>
      {icon}
    </div>
    <p className="text-sm font-semibold text-on-surface leading-tight">{title}</p>
    <p className="text-[11px] text-on-surface-variant/70 mt-0.5 font-medium uppercase tracking-wide">{subtitle}</p>
  </button>
)

const ActivitySection = ({
  transactions, categories, selectedDate, onNavigate,
}: {
  transactions: any[]
  categories: any[]
  selectedDate: Date
  onNavigate: (p: string) => void
}) => {
  const currentMonth = selectedDate.getMonth()
  const currentYear  = selectedDate.getFullYear()

  const filtered = transactions
    .filter((tx) => {
      const d = new Date(tx.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .slice(0, 6)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-headline font-bold text-on-surface">
          Hoạt động gần đây
        </h3>
        <button
          onClick={() => onNavigate('/ledger')}
          className="flex items-center gap-0.5 text-xs text-primary font-semibold hover:underline"
        >
          Xem tất cả
          <ChevronRight size={14} />
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl border-2 border-dashed border-outline-variant/30 p-10 text-center space-y-3">
          <div className="w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center mx-auto">
            <Inbox size={22} className="text-on-surface-variant/40" />
          </div>
          <p className="text-sm text-on-surface-variant/60 font-medium">
            Chưa có giao dịch trong tháng này
          </p>
          <Link
            to="/add"
            className="inline-block text-xs text-primary font-semibold hover:underline"
          >
            Thêm giao dịch đầu tiên →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx, idx) => (
            <TransactionCard
              key={tx.id}
              tx={tx}
              categories={categories}
              index={idx}
              onClick={() => onNavigate(`/edit/${tx.id}`)}
              showDate
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Home
