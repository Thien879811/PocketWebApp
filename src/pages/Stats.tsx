import { formatCurrency } from '@/utils/format'
import { LoadingScreen } from '@/components/Loading'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Inbox, AlertCircle, TrendingUp, Calendar, Wallet, Settings2
} from 'lucide-react'
import { useTransactions, getTransactionStats } from '../features/transactions/hooks/useTransactions'
import { useCategories } from '../features/categories/hooks/useCategories'
import CategoryDetailModal from '../components/CategoryDetailModal'
import { type Category } from '../features/categories/types/category.schema'
import { TRANSACTION_TYPES_METADATA } from '../types/transaction.types'
import { MonthSelector } from '@/components/MonthSelector'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const STAT_TYPES = ['expense', 'income', 'borrow', 'lend'] as const
type StatsType = typeof STAT_TYPES[number]

const Stats: React.FC = () => {
  const navigate = useNavigate()
  const { data: transactions, isLoading: txLoading } = useTransactions()
  const { data: categories, isLoading: catLoading } = useCategories()
  const [selectedModalCategory, setSelectedModalCategory] = useState<Category | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [statsType, setStatsType] = useState<StatsType>('expense')

  const stats = transactions && categories
    ? getTransactionStats(transactions, categories, selectedDate)
    : null

  const handleCategoryClick = (categoryId: string) => {
    const cat = categories?.find((c) => c.id === categoryId)
    if (cat) { setSelectedModalCategory(cat); setIsModalOpen(true) }
  }

  const now = new Date()
  const isCurrentMonth =
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getFullYear() === now.getFullYear()

  const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()
  const daysLeft = isCurrentMonth ? lastDay - now.getDate() + 1 : 0

  const filteredCategories = categories?.filter(c => c.type === statsType) || []

  const allCategoriesWithData = filteredCategories.map((cat) => {
    let cs: any
    if (statsType === 'expense')  cs = stats?.topCategories?.find(s => s.id === cat.id)
    if (statsType === 'income')   cs = stats?.topIncomeCategories?.find(s => s.id === cat.id)
    if (statsType === 'borrow')   cs = stats?.topBorrowCategories?.find(s => s.id === cat.id)
    if (statsType === 'lend')     cs = stats?.topLendCategories?.find(s => s.id === cat.id)
    return { ...cat, amount: cs?.amount || 0, count: cs?.count || 0 }
  }).sort((a, b) => b.amount - a.amount)

  let displayTotal = 0
  if (statsType === 'expense') displayTotal = stats?.totalExpense || 0
  if (statsType === 'income')  displayTotal = stats?.totalIncome || 0
  if (statsType === 'borrow')  displayTotal = stats?.totalBorrow || 0
  if (statsType === 'lend')    displayTotal = stats?.totalLend || 0

  const totalBudget = allCategoriesWithData.reduce((a, c) => a + (c.limit || 0), 0) || 10_000_000
  const progress = Math.min((displayTotal / totalBudget) * 100, 100)
  const remainingBudget = Math.max(totalBudget - displayTotal, 0)
  const dailyLimit = daysLeft > 0 ? remainingBudget / daysLeft : 0

  if (txLoading || catLoading) {
    return <LoadingScreen message="Đang phân tích thống kê..." />
  }

  const typeMeta = TRANSACTION_TYPES_METADATA[statsType]

  return (
    <div className="max-w-xl mx-auto md:max-w-none space-y-5 pb-8">

      {/* ── Page Title ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
          Thống kê
        </h1>
        <div className="w-9 h-9 bg-surface-container rounded-xl flex items-center justify-center">
          <TrendingUp size={18} className="text-primary" />
        </div>
      </div>

      {/* ── Month Selector ───────────────────────── */}
      <MonthSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* ── Type Toggle ──────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {STAT_TYPES.map((type) => {
          const meta = TRANSACTION_TYPES_METADATA[type]
          const active = statsType === type
          return (
            <button
              key={type}
              onClick={() => setStatsType(type)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap",
                active
                  ? "bg-primary text-white shadow-sm shadow-primary/30"
                  : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant/20 hover:border-primary/30"
              )}
            >
              {meta.label}
            </button>
          )
        })}
      </div>

      {!stats || stats.thisMonthCount === 0 ? (
        <EmptyState month={selectedDate.getMonth() + 1} year={selectedDate.getFullYear()} />
      ) : (
        <>
          {/* ── Hero Card ──────────────────────────── */}
          <div className="bg-gradient-to-br from-primary to-[#3b5cf6] rounded-2xl p-6 text-white relative overflow-hidden shadow-elevated shadow-primary/25">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/8 rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-white/70 font-medium uppercase tracking-wider mb-1">
                    Tổng {typeMeta?.label?.toLowerCase()} tháng này
                  </p>
                  <h2 className="text-3xl font-headline font-bold tracking-tight">
                    {formatCurrency(displayTotal)}
                  </h2>
                </div>
                <span className="text-xs bg-white/15 rounded-full px-3 py-1 font-medium">
                  {selectedDate.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-2 mt-2">
                <div className="flex justify-between text-xs text-white/70">
                  <span>{Math.round(progress)}% ngân sách</span>
                  <span>Mục tiêu: {formatCurrency(totalBudget)}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Budget warning */}
              {isCurrentMonth && progress > 80 && (
                <div className="flex items-center gap-2 bg-white/15 rounded-xl p-3 mt-4 text-xs font-medium">
                  <AlertCircle size={14} className="flex-shrink-0 animate-pulse" />
                  Sắp đạt giới hạn! Hãy chi tiêu cẩn thận hơn.
                </div>
              )}
            </div>
          </div>

          {/* ── Stats Bento ──────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <StatBentoCard
              icon={<Calendar size={18} />}
              iconBg="bg-primary/10 text-primary"
              label={isCurrentMonth ? 'Còn lại' : 'Số ngày'}
              value={`${isCurrentMonth ? daysLeft : lastDay} ngày`}
            />
            <StatBentoCard
              icon={<Wallet size={18} />}
              iconBg="bg-secondary/10 text-secondary"
              label={isCurrentMonth ? 'Hạn mức / Ngày' : 'TB / Ngày'}
              value={formatCurrency(Math.round(
                isCurrentMonth ? dailyLimit : displayTotal / lastDay
              ))}
              compact
            />
          </div>

          {/* ── Category Breakdown ───────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-on-surface">
                Phân tích theo {typeMeta?.label?.toLowerCase()}
              </h3>
              <button
                onClick={() => navigate('/settings/categories')}
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
              >
                <Settings2 size={12} />
                Chỉnh sửa
              </button>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden shadow-card divide-y divide-outline-variant/10">
              {allCategoriesWithData.map((cat) => {
                const pct = cat.limit
                  ? Math.min((cat.amount / cat.limit) * 100, 100)
                  : displayTotal > 0
                    ? (cat.amount / displayTotal) * 100
                    : 0
                const overBudget = cat.limit && cat.amount > cat.limit && statsType === 'expense'

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-surface-container/50 active:bg-primary/5 transition-colors text-left"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      cat.color || "bg-surface-container-high"
                    )}>
                      <span className="material-symbols-outlined text-[18px] text-white">
                        {cat.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-sm font-semibold text-on-surface truncate">
                          {cat.name}
                        </span>
                        <span className="text-xs text-on-surface-variant/70 font-medium ml-2 flex-shrink-0">
                          {formatCurrency(cat.amount)}
                          {cat.limit ? ` / ${formatCurrency(cat.limit)}` : ''}
                        </span>
                      </div>
                      <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-700",
                            overBudget ? "bg-error animate-pulse" : (cat.color || "bg-primary")
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {overBudget && (
                        <p className="text-[10px] text-error font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle size={10} />
                          Vượt {formatCurrency(cat.amount - cat.limit!)}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}

              {allCategoriesWithData.length === 0 && (
                <div className="py-10 text-center text-sm text-on-surface-variant/60">
                  Không có danh mục nào
                </div>
              )}
            </div>
          </div>
        </>
      )}

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

const EmptyState = ({ month, year }: { month: number; year: number }) => (
  <div className="py-20 text-center space-y-4">
    <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mx-auto">
      <Inbox size={26} className="text-on-surface-variant/40" />
    </div>
    <div>
      <p className="font-semibold text-on-surface">Không có dữ liệu</p>
      <p className="text-sm text-on-surface-variant/70 mt-1">
        Tháng {month}/{year} chưa có giao dịch nào
      </p>
    </div>
  </div>
)

const StatBentoCard = ({
  icon, iconBg, label, value, compact = false,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  compact?: boolean
}) => (
  <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/20 shadow-card">
    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", iconBg)}>
      {icon}
    </div>
    <p className="text-[11px] text-on-surface-variant/70 font-medium uppercase tracking-wide mb-1">
      {label}
    </p>
    <p className={cn("font-headline font-bold text-on-surface leading-tight", compact ? "text-xl" : "text-2xl")}>
      {value}
    </p>
  </div>
)

export default Stats
