import { formatCurrency } from '@/utils/format'
import { cn } from '@/utils/cn'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X, ChevronRight, Calendar, Wallet, AlertTriangle, User, Clock, Target } from 'lucide-react'
import { transactionSchema, type TransactionFormValues } from '../types/transaction.schema'
import { useCreateTransaction } from '../hooks/useTransactionMutations'
import { useCategories } from '../../categories/hooks/useCategories'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import { useGoals } from '../../goals/hooks/useGoals'
import { useBudgetByDate, useBudgetStatus } from '../../budget/hooks/useBudget'
import { useTransactionForm } from '../hooks/useTransactionForm'
import { QuickAmountChips } from '../components/QuickAmountChips'
import { TransactionTypeToggle } from '../components/TransactionTypeToggle'
import { BorrowLendSubToggle } from '../components/BorrowLendSubToggle'
import { CategoryGrid } from '../components/CategoryGrid'
import { AccountSelectorDrawer } from '../components/AccountSelectorDrawer'

const AddTransaction: React.FC = () => {
  const navigate = useNavigate()
  const { mutate: createTransaction, isPending } = useCreateTransaction()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: accounts } = useAccounts()
  const { data: goals } = useGoals()

  const { handleSubmit, register, setValue, watch, formState: { errors } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      type: 'expense',
      category_id: '',
      goal_id: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
      account_id: '',
      due_date: '',
      person_name: '',
    },
  })

  const {
    transactionType,
    showAccountSelector,
    setShowAccountSelector,
    handleTypeChange,
    handleSubTypeChange,
    filteredCategories,
  } = useTransactionForm(categories, setValue)

  const dateStr = watch('date') || new Date().toISOString().split('T')[0]
  const { data: currentPlan } = useBudgetByDate(dateStr)
  const budgetStatus = useBudgetStatus(currentPlan, dateStr)
  const todayStatus = budgetStatus?.todayStatus

  const currentAmount = watch('amount')
  const selectedCategoryId = watch('category_id')
  const selectedGoalId = watch('goal_id')
  const selectedAccountId = watch('account_id')
  const selectedAccount = accounts?.find((a) => a.id === selectedAccountId)

  const handleQuickAdd = (val: number) => setValue('amount', (currentAmount || 0) + val)

  const onSubmit = (data: TransactionFormValues) => {
    const submissionData = { ...data, type: transactionType }
    if (transactionType === 'withdrawal' && !data.category_id) {
      // @ts-ignore
      submissionData.category_id = null
    }
    
    if (transactionType === 'savings' && !data.goal_id) {
      // @ts-ignore
      submissionData.goal_id = null
    }
    
    if (transactionType === 'borrow' || transactionType === 'lend') {
      if (!data.due_date || data.due_date.trim() === '') {
        // @ts-ignore
        submissionData.due_date = null
      }
      if (!data.person_name || data.person_name.trim() === '') {
        // @ts-ignore
        submissionData.person_name = null
      }
    } else {
      // @ts-ignore
      submissionData.due_date = null
      // @ts-ignore
      submissionData.person_name = null
    }

    createTransaction(submissionData)
  }

  const isBudgetEmpty = Boolean(currentPlan && todayStatus?.budgetEmpty && transactionType === 'expense')
  const targetRemaining = isBudgetEmpty ? 0 : (todayStatus?.remainingDaily || 0)
  const willExceed = Boolean(currentPlan && transactionType === 'expense' && (currentAmount || 0) > targetRemaining)

  React.useEffect(() => {
    if (willExceed && 'vibrate' in navigator) navigator.vibrate(200)
  }, [willExceed])

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

              {(currentAmount || 0) > 0 && (
                <div className="flex justify-center mt-2">
                  <button
                    type="button"
                    onClick={() => setValue('amount', 0)}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-xs font-semibold text-on-surface-variant/60 hover:bg-error/10 hover:text-error transition-colors"
                  >
                    <X size={11} strokeWidth={2.5} />
                    Reset
                  </button>
                </div>
              )}

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

              <QuickAmountChips onAdd={handleQuickAdd} className="mt-4" />
            </div>

            {/* ── Type Toggle ─────────────────────── */}
            <TransactionTypeToggle
              value={transactionType}
              onChange={(typeKey) => {
                handleTypeChange(typeKey)
              }}
            />

            {/* ── Borrow/Lend Sub-toggle ──────────── */}
            <BorrowLendSubToggle
              value={transactionType}
              onChange={(type) => {
                handleSubTypeChange(type)
              }}
            />

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
              <CategoryGrid
                categories={filteredCategories}
                selectedId={selectedCategoryId}
                onSelect={(id) => setValue('category_id', id)}
                transactionType={transactionType}
                isLoading={categoriesLoading}
                showAddButton
              />
            </div>

            {/* ── Goal Selector for Savings ────────── */}
            {transactionType === 'savings' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">
                    Mục tiêu
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/goals')}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Quản lý
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {goals && goals.length > 0 ? (
                    goals.map((goal) => (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => setValue('goal_id', goal.id)}
                        className={cn(
                          'flex items-center gap-2.5 p-3.5 rounded-2xl border-2 transition-all text-left',
                          selectedGoalId === goal.id
                            ? 'bg-green-600/10 border-green-600 shadow-sm'
                            : 'bg-surface-container-lowest border-outline-variant/20 hover:bg-surface-container'
                        )}
                      >
                        <div className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                          selectedGoalId === goal.id ? 'bg-green-600 text-white' : 'bg-surface-container text-primary'
                        )}>
                          <Target size={16} strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-on-surface truncate">{goal.name}</p>
                          <p className="text-[10px] text-on-surface-variant/60 font-medium mt-0.5">
                            {goal.current_amount > 0 ? formatCurrency(goal.current_amount) : '0đ'}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-4">
                      <p className="text-xs text-on-surface-variant/60 mb-2">Chưa có mục tiêu nào</p>
                      <button
                        type="button"
                        onClick={() => navigate('/goals/add')}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        Tạo mục tiêu ngay
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Details ──────────────────────────── */}
            <div className="space-y-3">

              {/* Account */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAccountSelector(true)}
                  className={cn(
                    'w-full flex items-center gap-3.5 p-4 rounded-2xl border transition-all text-left',
                    errors.account_id
                      ? 'bg-error/5 border-error/40'
                      : selectedAccountId
                        ? 'bg-primary/5 border-primary/25'
                        : 'bg-surface-container-lowest border-outline-variant/20 hover:bg-surface-container'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    errors.account_id ? 'bg-error/10 text-error' : selectedAccountId ? 'bg-primary text-white' : 'bg-surface-container text-primary'
                  )}>
                    <Wallet size={18} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-wider mb-0.5">
                      Tài khoản
                    </p>
                    <p className={cn(
                      'text-sm font-semibold truncate',
                      errors.account_id ? 'text-error' : selectedAccountId ? 'text-on-surface' : 'text-on-surface-variant/60 italic'
                    )}>
                      {selectedAccount ? selectedAccount.name : 'Chọn tài khoản...'}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-on-surface-variant/40 flex-shrink-0" />
                </button>
                {errors.account_id && (
                  <p className="flex items-center gap-1 text-xs text-error font-medium mt-1.5 px-1">
                    <AlertTriangle size={11} />
                    {errors.account_id.message}
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <div className={cn(
                  'flex items-center gap-3.5 p-4 rounded-2xl border',
                  errors.date ? 'bg-error/5 border-error/40' : 'bg-surface-container-lowest border-outline-variant/20'
                )}>
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    errors.date ? 'bg-error/10 text-error' : 'bg-surface-container text-primary'
                  )}>
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
                {errors.date && (
                  <p className="flex items-center gap-1 text-xs text-error font-medium mt-1.5 px-1">
                    <AlertTriangle size={11} />
                    {errors.date.message}
                  </p>
                )}
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

              {/* Person name for borrow/lend */}
              {(transactionType === 'borrow' || transactionType === 'lend') && (
                <div>
                  <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20">
                    <div className="w-10 h-10 bg-surface-container text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <User size={18} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-wider mb-0.5">
                        {transactionType === 'borrow' ? 'Người cho vay' : 'Người vay'}
                      </p>
                      <input
                        {...register('person_name')}
                        type="text"
                        placeholder="Nhập tên..."
                        className="w-full bg-transparent border-none p-0 text-sm font-semibold text-on-surface focus:ring-0 placeholder:text-on-surface-variant/40"
                      />
                    </div>
                  </div>
                  {errors.person_name && (
                    <p className="flex items-center gap-1 text-xs text-error font-medium mt-1.5 px-1">
                      <AlertTriangle size={11} />
                      {errors.person_name.message}
                    </p>
                  )}
                </div>
              )}

              {/* Due date for borrow/lend */}
              {(transactionType === 'borrow' || transactionType === 'lend') && (
                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                  <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock size={18} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-amber-600/80 uppercase tracking-wider mb-0.5">
                      Ngày đến hạn {transactionType === 'borrow' ? 'trả nợ' : 'thu hồi'}
                    </p>
                    <input
                      {...register('due_date')}
                      type="date"
                      className="w-full bg-transparent border-none p-0 text-sm font-semibold text-on-surface focus:ring-0"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
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
                {errors.note && (
                  <p className="flex items-center gap-1 text-xs text-error font-medium mt-1.5 px-1">
                    <AlertTriangle size={11} />
                    {errors.note.message}
                  </p>
                )}
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

        <AccountSelectorDrawer
          open={showAccountSelector}
          onClose={() => setShowAccountSelector(false)}
          accounts={accounts}
          selectedId={selectedAccountId}
          onSelect={(id) => setValue('account_id', id)}
        />
      </div>
    </div>
  )
}

export default AddTransaction
