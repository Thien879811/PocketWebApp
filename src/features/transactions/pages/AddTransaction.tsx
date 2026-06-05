import { formatCurrency } from '@/utils/format'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Loader2, X, ChevronRight, Calendar, Wallet,
  LayoutGrid, Inbox, Check, AlertTriangle
} from 'lucide-react'
import { transactionSchema, type TransactionFormValues } from '../types/transaction.schema'
import { useCreateTransaction } from '../hooks/useTransactionMutations'
import { useCategories } from '../../categories/hooks/useCategories'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import { useBudgetByDate, getDailyBudgetStatus } from '../../budget/hooks/useBudget'
import { useTransactions } from '../../transactions/hooks/useTransactions'
import { TRANSACTION_TYPES_METADATA, type TransactionType } from '@/types/transaction.types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const AddTransaction: React.FC = () => {
  const navigate = useNavigate()
  const { mutate: createTransaction, isPending } = useCreateTransaction()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: accounts } = useAccounts()

  const [transactionType, setTransactionType] = useState<TransactionType>('expense')
  const [showAccountSelector, setShowAccountSelector] = useState(false)

  const { handleSubmit, register, setValue, watch, formState: { errors } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      type: 'expense',
      category_id: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
      account_id: '',
    },
  })

  const dateStr = watch('date') || new Date().toISOString().split('T')[0]
  const { data: currentPlan } = useBudgetByDate(dateStr)
  const { data: transactions } = useTransactions()

  const currentAmount = watch('amount')
  const selectedCategoryId = watch('category_id')
  const selectedAccountId = watch('account_id')
  const selectedAccount = accounts?.find((a) => a.id === selectedAccountId)

  const handleQuickAdd = (val: number) => setValue('amount', (currentAmount || 0) + val)

  const onSubmit = (data: TransactionFormValues) => {
    const submissionData = { ...data, type: transactionType }
    if (transactionType === 'withdrawal' && !data.category_id) {
      // @ts-ignore
      submissionData.category_id = null
    }
    createTransaction(submissionData)
  }

  const filteredCategories = categories?.filter((cat) => {
    if (transactionType === 'borrow' || transactionType === 'lend') {
      return cat.type === transactionType || cat.type === 'income' || cat.type === 'expense'
    }
    return cat.type === transactionType
  }) || []

  const todayStatus = currentPlan && transactions
    ? getDailyBudgetStatus(currentPlan, transactions, dateStr)
    : null

  const isBudgetEmpty = Boolean(currentPlan && todayStatus?.budgetEmpty && transactionType === 'expense')
  const targetRemaining = isBudgetEmpty ? 0 : (todayStatus?.remainingDaily || 0)
  const willExceed = Boolean(currentPlan && transactionType === 'expense' && (currentAmount || 0) > targetRemaining)

  React.useEffect(() => {
    if (willExceed && 'vibrate' in navigator) navigator.vibrate(200)
  }, [willExceed])

  const TYPE_OPTIONS = (['income', 'expense', 'withdrawal', 'borrow', 'business'] as const)

  return (
    <div className="min-h-screen bg-surface md:flex md:items-center md:justify-center md:p-8">
      <div className="w-full max-w-[430px] md:max-w-lg bg-surface relative flex flex-col md:rounded-3xl md:shadow-2xl md:border md:border-outline-variant/20 md:max-h-[900px]">

        {/* ── Header ─────────────────────────────── */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-5 h-14 bg-surface/90 backdrop-blur-md border-b border-outline-variant/10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-container transition-colors active:scale-90"
          >
            <X size={20} className="text-on-surface" />
          </button>
          <h1 className="text-base font-headline font-bold text-on-surface">Giao dịch mới</h1>
          <div className="w-9" />
        </header>

        {/* ── Scrollable content ───────────────────── */}
        <main className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-36 pt-4">
          <form id="transaction-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* ── Amount ──────────────────────────── */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5">
              <p className="text-xs text-on-surface-variant/70 font-medium uppercase tracking-wider text-center mb-2">
                Số tiền
              </p>
              <div className="flex items-baseline justify-center gap-2">
                <input
                  {...register('amount', { valueAsNumber: true })}
                  type="number"
                  step="any"
                  autoFocus
                  placeholder="0"
                  className="bg-transparent border-none text-5xl font-headline font-bold text-primary text-center w-full max-w-[220px] p-0 focus:ring-0"
                />
                <span className="text-xl font-semibold text-on-surface-variant/60">đ</span>
              </div>

              {errors.amount && (
                <p className="text-xs text-error text-center mt-2 font-medium">{errors.amount.message}</p>
              )}

              {/* Budget alerts */}
              {isBudgetEmpty && (
                <div className="flex items-center gap-2 mt-3 bg-secondary/8 text-secondary rounded-xl px-3 py-2 text-xs font-semibold">
                  <AlertTriangle size={14} />
                  Ngân sách kế hoạch đã cạn. Bạn vẫn có thể lưu giao dịch.
                </div>
              )}
              {!isBudgetEmpty && willExceed && (
                <div className="flex items-center gap-2 mt-3 bg-error/8 text-error rounded-xl px-3 py-2 text-xs font-semibold animate-pulse">
                  <AlertTriangle size={14} />
                  Vượt hạn mức {formatCurrency(targetRemaining)}/ngày
                </div>
              )}

              {/* Quick chips */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {[1,2,5,10,20,50,100,200,500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAdd(val * 1000)}
                    className="px-3 py-1.5 bg-surface-container rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors flex-shrink-0"
                  >
                    +{val}k
                  </button>
                ))}
              </div>
            </div>

            {/* ── Type Toggle ─────────────────────── */}
            <div className="bg-surface-container rounded-2xl p-1 flex gap-1 overflow-x-auto scrollbar-hide">
              {TYPE_OPTIONS.map((typeKey) => {
                const meta = TRANSACTION_TYPES_METADATA[typeKey]
                const active = typeKey === 'borrow'
                  ? (transactionType === 'borrow' || transactionType === 'lend')
                  : transactionType === typeKey
                return (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() => {
                      const next = typeKey === 'borrow' ? 'borrow' : typeKey
                      setTransactionType(next)
                      setValue('type', next)
                      if (typeKey === 'withdrawal') setValue('category_id', '')
                    }}
                    className={cn(
                      "flex-shrink-0 px-3.5 py-2 rounded-xl text-[11px] font-semibold transition-all whitespace-nowrap",
                      active
                        ? "bg-surface-container-lowest text-on-surface shadow-sm"
                        : "text-on-surface-variant/60 hover:text-on-surface"
                    )}
                  >
                    {typeKey === 'borrow' ? 'Mượn/Trả' : meta.label}
                  </button>
                )
              })}
            </div>

            {/* ── Borrow/Lend Sub-toggle ──────────── */}
            {(transactionType === 'borrow' || transactionType === 'lend') && (
              <div className="bg-surface-container rounded-xl p-1 flex gap-1">
                {(['borrow', 'lend'] as const).map((typeKey) => {
                  const meta = TRANSACTION_TYPES_METADATA[typeKey]
                  return (
                    <button
                      key={typeKey}
                      type="button"
                      onClick={() => { setTransactionType(typeKey); setValue('type', typeKey) }}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-semibold transition-all",
                        transactionType === typeKey
                          ? "bg-surface-container-lowest text-on-surface shadow-sm"
                          : "text-on-surface-variant/70"
                      )}
                    >
                      {meta.label} ({meta.prefix})
                    </button>
                  )
                })}
              </div>
            )}

            {/* ── Category Grid ────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">
                  Danh mục
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/settings/categories')}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Quản lý
                </button>
              </div>

              {categoriesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : filteredCategories.length === 0 ? (
                <button
                  type="button"
                  onClick={() => navigate('/settings/categories/add')}
                  className="w-full bg-surface-container rounded-2xl p-6 text-center border-2 border-dashed border-outline-variant/30 hover:border-primary/40 transition-colors"
                >
                  <Inbox size={22} className="text-on-surface-variant/40 mx-auto mb-2" />
                  <p className="text-xs text-on-surface-variant/60 font-medium">
                    Chưa có danh mục
                  </p>
                  <p className="text-xs text-primary font-semibold mt-1">Thêm ngay →</p>
                </button>
              ) : (
                <div className="grid grid-cols-4 gap-2.5">
                  {filteredCategories.map((cat) => {
                    const active = selectedCategoryId === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setValue('category_id', cat.id)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 active:scale-90",
                          active
                            ? "bg-primary/10 ring-2 ring-primary/30 shadow-sm"
                            : "bg-surface-container hover:bg-surface-container-high"
                        )}
                      >
                        <span
                          className={cn(
                            "material-symbols-outlined text-[22px] transition-colors",
                            active ? "text-primary" : "text-on-surface-variant"
                          )}
                          style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {cat.icon}
                        </span>
                        <span className="text-[10px] font-semibold text-on-surface-variant truncate w-full text-center leading-none">
                          {cat.name}
                        </span>
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => navigate('/settings/categories/add')}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-surface-container border-2 border-dashed border-outline-variant/30 text-on-surface-variant/50 hover:text-primary hover:border-primary/40 transition-all active:scale-90"
                  >
                    <LayoutGrid size={20} />
                    <span className="text-[10px] font-semibold">Mới</span>
                  </button>
                </div>
              )}
            </div>

            {/* ── Details ──────────────────────────── */}
            <div className="space-y-3">

              {/* Account */}
              <button
                type="button"
                onClick={() => setShowAccountSelector(true)}
                className={cn(
                  "w-full flex items-center gap-3.5 p-4 rounded-2xl border transition-all text-left",
                  selectedAccountId
                    ? "bg-primary/5 border-primary/25"
                    : "bg-surface-container-lowest border-outline-variant/20 hover:bg-surface-container"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  selectedAccountId ? "bg-primary text-white" : "bg-surface-container text-primary"
                )}>
                  <Wallet size={18} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-wider mb-0.5">
                    Tài khoản
                  </p>
                  <p className={cn(
                    "text-sm font-semibold truncate",
                    selectedAccountId ? "text-on-surface" : "text-on-surface-variant/60 italic"
                  )}>
                    {selectedAccount ? selectedAccount.name : 'Chọn tài khoản...'}
                  </p>
                </div>
                <ChevronRight size={16} className="text-on-surface-variant/40 flex-shrink-0" />
              </button>

              {/* Date */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20">
                <div className="w-10 h-10 bg-surface-container text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-wider mb-0.5">
                    Ngày
                  </p>
                  <input
                    {...register('date')}
                    type="date"
                    className="w-full bg-transparent border-none p-0 text-sm font-semibold text-on-surface focus:ring-0"
                  />
                </div>
              </div>

              {/* Withdrawal fee */}
              {transactionType === 'withdrawal' && (
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20">
                  <p className="text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-wider mb-1.5">
                    Phí rút tiền
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      {...register('fee', { valueAsNumber: true })}
                      type="number"
                      step="any"
                      placeholder="0"
                      className="flex-1 bg-transparent border-none p-0 text-sm font-semibold text-on-surface focus:ring-0"
                    />
                    <span className="text-sm text-on-surface-variant/60 font-medium">đ</span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20">
                <p className="text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-wider mb-2">
                  Ghi chú
                </p>
                <textarea
                  {...register('note')}
                  placeholder="Bạn đã chi tiêu gì?..."
                  className="w-full bg-transparent border-none p-0 text-sm font-medium text-on-surface focus:ring-0 min-h-[80px] resize-none placeholder:text-on-surface-variant/40 leading-relaxed"
                />
              </div>
            </div>
          </form>
        </main>

        {/* ── Footer Submit ─────────────────────── */}
        <footer className="absolute bottom-0 left-0 right-0 p-4 bg-surface/95 backdrop-blur-lg border-t border-outline-variant/10 z-20">
          <button
            type="submit"
            form="transaction-form"
            disabled={isPending}
            className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-base flex items-center justify-center gap-2 shadow-md shadow-primary/30 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? <Loader2 size={20} className="animate-spin" /> : 'Lưu giao dịch'}
          </button>
        </footer>

        {/* ── Account Selector Sheet ──────────────── */}
        {showAccountSelector && (
          <div className="fixed inset-0 z-[100] flex flex-col">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAccountSelector(false)}
            />
            <div className="mt-auto bg-surface rounded-t-3xl z-10 relative animate-in slide-in-from-bottom-4 duration-300">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-outline-variant/50 rounded-full" />
              </div>

              <div className="px-5 py-4 flex items-center justify-between border-b border-outline-variant/10">
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  Chọn tài khoản
                </h3>
                <button
                  onClick={() => setShowAccountSelector(false)}
                  className="w-8 h-8 bg-surface-container rounded-xl flex items-center justify-center hover:bg-surface-container-high transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="px-5 py-3 pb-8 space-y-2 max-h-[60vh] overflow-y-auto">
                {accounts?.map((acc) => {
                  const active = selectedAccountId === acc.id
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => { setValue('account_id', acc.id); setShowAccountSelector(false) }}
                      className={cn(
                        "w-full flex items-center gap-3.5 p-4 rounded-2xl transition-all border text-left",
                        active
                          ? "bg-primary text-white border-primary"
                          : "bg-surface-container-lowest border-outline-variant/20 hover:bg-surface-container"
                      )}
                    >
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                        active ? "bg-white/20" : "bg-surface-container text-primary"
                      )}>
                        <Wallet size={20} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-tight">{acc.name}</p>
                        <p className={cn("text-xs mt-0.5 font-medium", active ? "text-white/70" : "text-on-surface-variant/60")}>
                          {formatCurrency(acc.balance)}
                        </p>
                      </div>
                      {active && <Check size={16} className="flex-shrink-0" strokeWidth={2.5} />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddTransaction
