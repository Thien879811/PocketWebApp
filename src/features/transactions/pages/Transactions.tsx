import { formatCurrency } from '@/utils/format'
import { cn } from '@/utils/cn'
import { LoadingScreen } from '@/components/Loading'
import React, { useState } from 'react'
import { Inbox, Search, Filter, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../../categories/hooks/useCategories'
import { TRANSACTION_TYPES_METADATA, type TransactionType } from '@/types/transaction.types'
import { MonthSelector } from '@/components/MonthSelector'
import { TransactionCard } from '@/components/shared/TransactionCard'

const Transactions: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<TransactionType | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState(new Date())

  const { data: transactions, isLoading: txLoading } = useTransactions()
  const { data: categories } = useCategories()

  const filteredTransactions = transactions?.filter((tx) => {
    const txDate = new Date(tx.date)
    const isSameMonth =
      txDate.getMonth() === selectedDate.getMonth() &&
      txDate.getFullYear() === selectedDate.getFullYear()
    if (!isSameMonth) return false

    const cat = categories?.find((c) => c.id === tx.category_id)
    const categoryName = cat?.name || (tx.type === 'withdrawal' ? 'Rút tiền' : '')
    const matchesSearch =
      categoryName.toLowerCase().includes(search.toLowerCase()) ||
      (tx.note || '').toLowerCase().includes(search.toLowerCase())
    const matchesTypeFilter = filter === 'all' || tx.type === filter
    const matchesCategoryFilter = categoryFilter === 'all' || tx.category_id === categoryFilter
    return matchesSearch && matchesTypeFilter && matchesCategoryFilter
  })

  // Group by date
  const groupedTransactions: Record<string, any[]> = {}
  filteredTransactions?.forEach((tx) => {
    const dateStr = new Date(tx.date).toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    if (!groupedTransactions[dateStr]) groupedTransactions[dateStr] = []
    groupedTransactions[dateStr].push(tx)
  })

  const hasActiveFilters = filter !== 'all' || categoryFilter !== 'all' || search !== ''

  const clearFilters = () => {
    setSearch('')
    setFilter('all')
    setCategoryFilter('all')
  }

  if (txLoading) return <LoadingScreen message="Đang tải giao dịch..." />

  const TYPE_FILTERS: (TransactionType | 'all')[] = ['all', 'expense', 'income', 'business', 'borrow', 'lend']

  return (
    <div className="max-w-xl mx-auto md:max-w-none space-y-4 pb-8">

      {/* ── Title + Filter button ─────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
          Sổ giao dịch
        </h1>
        <button
          onClick={() => {
            const idx = TYPE_FILTERS.indexOf(filter)
            setFilter(TYPE_FILTERS[(idx + 1) % TYPE_FILTERS.length])
          }}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
            filter !== 'all'
              ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
              : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/30"
          )}
        >
          <Filter size={12} strokeWidth={2.5} />
          {filter === 'all' ? 'Lọc' : TRANSACTION_TYPES_METADATA[filter as TransactionType]?.label}
        </button>
      </div>

      {/* ── Month Selector ───────────────────────── */}
      <MonthSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* ── Search ──────────────────────────────── */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo danh mục, ghi chú..."
          className="w-full h-11 bg-surface-container-lowest rounded-xl pl-10 pr-10 text-sm font-medium text-on-surface border border-outline-variant/20 placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/25 focus:border-primary/30 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Category chips ──────────────────────── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setCategoryFilter('all')}
          className={cn(
            "flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border",
            categoryFilter === 'all'
              ? "bg-primary text-white border-primary shadow-sm"
              : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/30"
          )}
        >
          Tất cả
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border",
              categoryFilter === cat.id
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/30"
            )}
          >
            <span className="material-symbols-outlined text-[13px]">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* ── Clear filters chip ──────────────────── */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 text-xs text-on-surface-variant/70 font-medium hover:text-primary transition-colors"
        >
          <X size={12} />
          Xóa bộ lọc
        </button>
      )}

      {/* ── Transaction Groups ──────────────────── */}
      {Object.entries(groupedTransactions).length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-12 text-center space-y-3 shadow-card">
          <div className="w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center mx-auto">
            <Inbox size={22} className="text-on-surface-variant/40" />
          </div>
          <p className="text-sm text-on-surface-variant/60 font-medium">
            Không tìm thấy giao dịch nào
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, items]) => {
            const dayTotal = items.reduce((sum, tx) => {
              const multiplier = tx.type === 'income' ? 1 : -1
              return sum + tx.amount * multiplier
            }, 0)

            return (
              <div key={date} className="space-y-2">
                {/* Date header */}
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-semibold text-on-surface-variant/70 capitalize">
                    {date}
                  </h3>
                  <span className={cn(
                    "text-xs font-bold",
                    dayTotal >= 0 ? "text-secondary" : "text-error"
                  )}>
                    {dayTotal >= 0 ? '+' : ''}{formatCurrency(Math.abs(dayTotal))}
                  </span>
                </div>

                {/* Alternating cards */}
                <div className="space-y-2">
                  {items.map((tx, idx) => (
                    <TransactionCard
                      key={tx.id}
                      tx={tx}
                      categories={categories}
                      index={idx}
                      onClick={() => navigate(`/edit/${tx.id}`)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Transactions
