import { formatCurrency } from '@/utils/format'
import React, { useMemo } from 'react'
import { X, TrendingUp, AlertCircle } from 'lucide-react'
import { type Category } from '@/features/categories/types/category.schema'
import { type Transaction } from '@/features/transactions/types/transaction.schema'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface CategoryDetailModalProps {
  category: Category | null
  transactions: Transaction[]
  isOpen: boolean
  onClose: () => void
  selectedDate?: Date
}

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  category,
  transactions,
  isOpen,
  onClose,
  selectedDate = new Date(),
}) => {
  // Tính toán dữ liệu liên quan đến danh mục
  const categoryData = useMemo(() => {
    if (!category) return null

    const targetMonth = selectedDate.getMonth()
    const targetYear = selectedDate.getFullYear()

    // Lọc giao dịch của danh mục hiện tại
    const categoryTransactions = transactions.filter(
      (tx) =>
        tx.category_id === category.id &&
        new Date(tx.date).getMonth() === targetMonth &&
        new Date(tx.date).getFullYear() === targetYear
    )

    // Tính toán thống kê
    const totalAmount = categoryTransactions.reduce((acc, tx) => acc + tx.amount, 0)
    const count = categoryTransactions.length
    const avgAmount = count > 0 ? totalAmount / count : 0
    const maxAmount = Math.max(...categoryTransactions.map((tx) => tx.amount), 0)
    const exceeded = category.limit ? totalAmount > category.limit : false
    const remaining = category.limit ? category.limit - totalAmount : null
    const progress = category.limit ? Math.min((totalAmount / category.limit) * 100, 100) : 0

    // Sắp xếp giao dịch theo ngày
    const sortedTransactions = [...categoryTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return {
      transactions: sortedTransactions,
      totalAmount,
      count,
      avgAmount,
      maxAmount,
      exceeded,
      remaining,
      progress,
    }
  }, [category, transactions, selectedDate])

  if (!isOpen || !category || !categoryData) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-surface rounded-t-[2.5rem] shadow-2xl z-50 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-outline-variant/10 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm',
                category.color || 'bg-primary/10'
              )}
            >
              <span className="material-symbols-outlined text-xl text-white">
                {category.icon || 'payments'}
              </span>
            </div>
            <div>
              <h2 className="font-headline font-black text-xl text-on-surface tracking-tight">
                {category.name}
              </h2>
              <p className="text-on-surface-variant text-xs font-medium opacity-60 italic">
                Tháng {selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-error/10 text-on-surface-variant hover:text-error transition-all"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-8 space-y-6">
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Spent */}
            <div className="bg-surface-container-lowest p-5 rounded-[2rem] border border-outline-variant/5">
              <p className="text-on-surface-variant text-xs font-black uppercase tracking-widest opacity-50 mb-2">
                Tổng chi tiêu
              </p>
              <p className="font-headline font-black text-2xl text-on-surface tracking-tighter">
                {formatCurrency(categoryData.totalAmount)}
              </p>
            </div>

            {/* Transaction Count */}
            <div className="bg-surface-container-lowest p-5 rounded-[2rem] border border-outline-variant/5">
              <p className="text-on-surface-variant text-xs font-black uppercase tracking-widest opacity-50 mb-2">
                Số giao dịch
              </p>
              <p className="font-headline font-black text-2xl text-on-surface tracking-tighter">
                {categoryData.count}
              </p>
            </div>

            {/* Average Amount */}
            <div className="bg-surface-container-lowest p-5 rounded-[2rem] border border-outline-variant/5">
              <p className="text-on-surface-variant text-xs font-black uppercase tracking-widest opacity-50 mb-2">
                Trung bình / giao dịch
              </p>
              <p className="font-headline font-black text-2xl text-on-surface tracking-tighter">
                {formatCurrency(categoryData.avgAmount)}
              </p>
            </div>

            {/* Max Amount */}
            <div className="bg-surface-container-lowest p-5 rounded-[2rem] border border-outline-variant/5">
              <p className="text-on-surface-variant text-xs font-black uppercase tracking-widest opacity-50 mb-2">
                Giao dịch lớn nhất
              </p>
              <p className="font-headline font-black text-2xl text-on-surface tracking-tighter">
                {formatCurrency(categoryData.maxAmount)}
              </p>
            </div>
          </div>

          {/* Budget Progress */}
          {category.limit && (
            <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/5">
              <div className="flex justify-between items-center mb-4">
                <p className="font-headline font-black text-sm text-on-surface">Hạn mức ngân sách</p>
                <span className="text-on-surface-variant text-xs font-black opacity-60">
                  {formatCurrency(categoryData.totalAmount)} / {formatCurrency(category.limit)}
                </span>
              </div>
              <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden mb-3">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000',
                    categoryData.exceeded ? 'bg-error animate-pulse' : category.color || 'bg-primary'
                  )}
                  style={{ width: `${categoryData.progress}%` }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant text-xs font-medium">
                  {Math.round(categoryData.progress)}% đã chi tiêu
                </span>
                <span
                  className={cn(
                    'text-xs font-black',
                    categoryData.exceeded ? 'text-error' : 'text-secondary'
                  )}
                >
                  {categoryData.exceeded
                    ? `Quá ${formatCurrency(categoryData.totalAmount - category.limit)}`
                    : `Còn ${formatCurrency(categoryData.remaining)}`}
                </span>
              </div>

              {categoryData.exceeded && (
                <div className="flex items-center gap-2 mt-4 p-3 bg-error/10 rounded-xl border border-error/20">
                  <AlertCircle size={16} className="text-error flex-shrink-0" />
                  <p className="text-error text-xs font-black uppercase tracking-tight">
                    Đã vượt quá hạn mức ngân sách
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Recent Transactions */}
          <div>
            <h3 className="font-headline font-black text-lg text-on-surface mb-4">Giao dịch trong tháng</h3>

            {categoryData.transactions.length > 0 ? (
              <div className="space-y-3">
                {categoryData.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-surface-container-lowest p-4 rounded-[1.5rem] flex justify-between items-center border border-outline-variant/5 hover:border-primary/20 transition-all"
                  >
                    <div className="flex-1">
                      <p className="font-headline font-black text-sm text-on-surface">{tx.note}</p>
                      <p className="text-on-surface-variant text-xs opacity-60 mt-1">
                        {new Date(tx.date).toLocaleDateString('vi-VN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'text-right',
                        tx.type === 'expense' ? 'text-error' : 'text-secondary'
                      )}
                    >
                      <p className="font-headline font-black text-sm">
                        {tx.type === 'expense' ? '-' : '+'}
                        {formatCurrency(tx.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 opacity-50">
                <TrendingUp size={24} className="mx-auto mb-2 text-on-surface-variant" />
                <p className="text-on-surface-variant text-sm font-medium">
                  Không có giao dịch nào trong danh mục này
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default CategoryDetailModal
