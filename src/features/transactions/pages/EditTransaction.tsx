import { cn } from '@/utils/cn'
import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X, ChevronRight, Calendar, Wallet, Trash2 } from 'lucide-react'
import { transactionSchema, type TransactionFormValues } from '../types/transaction.schema'
import { useUpdateTransaction, useDeleteTransaction } from '../hooks/useTransactionMutations'
import { useTransaction } from '../hooks/useTransactions'
import { useCategories } from '../../categories/hooks/useCategories'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import { useTransactionForm } from '../hooks/useTransactionForm'
import { QuickAmountChips } from '../components/QuickAmountChips'
import { TransactionTypeToggle } from '../components/TransactionTypeToggle'
import { BorrowLendSubToggle } from '../components/BorrowLendSubToggle'
import { CategoryGrid } from '../components/CategoryGrid'
import { AccountSelectorDrawer } from '../components/AccountSelectorDrawer'

const EditTransaction: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: transaction, isLoading: transactionLoading } = useTransaction(id)
  const { mutate: updateTransaction, isPending: updatePending } = useUpdateTransaction()
  const { mutate: deleteTransaction, isPending: deletePending } = useDeleteTransaction()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: accounts } = useAccounts()

  const { handleSubmit, register, setValue, watch, formState: { errors } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
  })

  const {
    transactionType,
    setTransactionType,
    showAccountSelector,
    setShowAccountSelector,
    handleTypeChange,
    handleSubTypeChange,
    filteredCategories,
  } = useTransactionForm(categories, setValue)

  useEffect(() => {
    if (transaction) {
      setValue('amount', transaction.amount)
      setValue('type', transaction.type)
      setValue('category_id', transaction.category_id)
      setValue('date', transaction.date)
      setValue('note', transaction.note || '')
      setValue('account_id', transaction.account_id)
      setValue('fee', transaction.fee || 0)
      setTransactionType(transaction.type)
    }
  }, [transaction, setValue, setTransactionType])

  const currentAmount = watch('amount')
  const selectedCategoryId = watch('category_id')
  const selectedAccountId = watch('account_id')
  const selectedAccount = accounts?.find(a => a.id === selectedAccountId)

  const handleQuickAdd = (val: number) => setValue('amount', (currentAmount || 0) + val)

  const onSubmit = (data: TransactionFormValues) => {
    if (!id) return
    const submissionData = { ...data, type: transactionType }
    if (transactionType === 'withdrawal' && !data.category_id) {
      // @ts-ignore - Supabase accepts null for category_id
      submissionData.category_id = null
    }
    updateTransaction({ id, data: submissionData })
  }

  const handleDelete = () => {
    if (!id) return
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      deleteTransaction(id, {
        onSuccess: () => navigate('/')
      })
    }
  }

  if (transactionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface md:flex md:items-center md:justify-center md:p-8">
      <div className="w-full max-w-[393px] md:max-w-xl bg-surface relative overflow-hidden flex flex-col md:rounded-[3rem] md:shadow-2xl md:h-[852px]">

        {/* Header */}
        <header className="sticky top-0 w-full z-20 flex justify-between items-center px-6 h-16 bg-surface/80 backdrop-blur-md">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-95 duration-200"
          >
            <X className="w-6 h-6 text-on-surface" />
          </button>
          <h1 className="font-headline font-bold text-xl tracking-tight text-primary">Chỉnh sửa giao dịch</h1>
          <button
            type="button"
            onClick={handleDelete}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-error/10 text-error transition-colors active:scale-95 duration-200"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-40 no-scrollbar">
          <form id="transaction-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 pt-4">

            {/* Amount Section */}
            <section className="text-center">
              <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-label text-label-sm uppercase tracking-widest text-on-surface-variant">Số tiền</span>
                  <div className="flex items-baseline gap-1">
                    <input
                      {...register('amount', { valueAsNumber: true })}
                      className="bg-transparent border-none text-display-lg font-headline text-primary focus:ring-0 text-center w-full max-w-[250px]"
                      placeholder="0"
                      type="number"
                      step="any"
                    />
                    <span className="text-headline-sm font-headline text-on-surface-variant">đ</span>
                  </div>
                  {errors.amount && <p className="text-xs text-error font-bold">{errors.amount.message}</p>}
                </div>

                {(currentAmount || 0) > 0 && (
                  <div className="flex justify-center mt-3">
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

                <QuickAmountChips onAdd={handleQuickAdd} className="mt-4" />
              </div>
            </section>

            {/* Type Toggle */}
            <TransactionTypeToggle
              value={transactionType}
              onChange={handleTypeChange}
            />

            {/* Borrow/Lend Sub-toggle */}
            <BorrowLendSubToggle
              value={transactionType}
              onChange={handleSubTypeChange}
            />

            {/* Category Grid */}
            <section>
              <div className="flex justify-between items-end mb-4 px-2">
                <h2 className="font-headline text-headline-sm font-bold opacity-80 uppercase tracking-tight text-sm">Danh mục</h2>
              </div>
              <CategoryGrid
                categories={filteredCategories}
                selectedId={selectedCategoryId}
                onSelect={(id) => setValue('category_id', id)}
                transactionType={transactionType}
                isLoading={categoriesLoading}
              />
            </section>

            {/* Form Details */}
            <section className="flex flex-col gap-4 mb-20">

              {/* Account Selector */}
              <div
                className={cn(
                  'flex items-center gap-4 p-5 rounded-3xl border transition-all cursor-pointer group shadow-sm',
                  selectedAccountId ? 'bg-primary/5 border-primary/20' : 'bg-surface-container-lowest border-outline-variant/10 hover:bg-surface-container-low'
                )}
                onClick={() => setShowAccountSelector(true)}
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', selectedAccountId ? 'bg-primary text-on-primary' : 'bg-surface-container text-primary')}>
                  <Wallet size={20} />
                </div>
                <div className="flex-1 text-left">
                  <label className="block font-label text-[10px] uppercase font-black text-outline opacity-70 mb-0.5">Tài khoản / Ví</label>
                  <span className={cn('text-body-md font-bold', selectedAccountId ? 'text-on-surface' : 'text-outline-variant italic')}>
                    {selectedAccount ? selectedAccount.name : 'Chọn một tài khoản...'}
                  </span>
                </div>
                <ChevronRight size={20} className="text-outline-variant group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Date Input */}
              <div className="flex items-center gap-4 bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/10 shadow-sm hover:bg-surface-container-low transition-colors">
                <Calendar className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <label className="block font-label text-[10px] uppercase font-black text-outline opacity-70 mb-0.5">Ngày tháng</label>
                  <input
                    {...register('date')}
                    type="date"
                    className="w-full bg-transparent border-none p-0 text-body-md font-bold focus:ring-0 text-on-surface"
                  />
                </div>
              </div>

              {/* Fee for Withdrawals */}
              {transactionType === 'withdrawal' && (
                <div className="flex items-center gap-4 bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/10 shadow-sm hover:bg-surface-container-low transition-colors">
                  <div className="flex-1">
                    <label className="block font-label text-[10px] uppercase font-black text-outline opacity-70 mb-0.5">Phí rút tiền ném vào ngân hàng</label>
                    <div className="flex items-center gap-1">
                      <input
                        {...register('fee', { valueAsNumber: true })}
                        type="number"
                        step="any"
                        placeholder="0"
                        className="w-full bg-transparent border-none p-0 text-body-md font-bold focus:ring-0 text-on-surface"
                      />
                      <span className="font-bold text-outline-variant">đ</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/10 shadow-sm">
                <label className="block font-label text-[10px] uppercase font-black text-outline opacity-70 mb-3">Ghi chú</label>
                <textarea
                  {...register('note')}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 min-h-[120px] text-on-surface placeholder:text-outline-variant/50 font-medium leading-relaxed"
                  placeholder="Bạn đã chi tiêu việc gì?..."
                />
              </div>
            </section>
          </form>
        </main>

        {/* Footer */}
        <footer className="absolute bottom-0 w-full p-6 pt-2 bg-surface/80 backdrop-blur-3xl z-[30] border-t border-white/20">
          <button
            type="submit"
            form="transaction-form"
            disabled={updatePending || deletePending}
            className="w-full bg-primary text-on-primary h-16 rounded-[1.5rem] font-headline font-black text-lg shadow-2xl shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {updatePending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Cập nhật giao dịch'}
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

export default EditTransaction
