import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X, ChevronRight, Calendar, Wallet, Inbox, Check, Trash2 } from 'lucide-react'
import { transactionSchema, type TransactionFormValues } from '../types/transaction.schema'
import { useUpdateTransaction, useDeleteTransaction } from '../hooks/useTransactionMutations'
import { useTransaction } from '../hooks/useTransactions'
import { useCategories } from '../../categories/hooks/useCategories'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const EditTransaction: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: transaction, isLoading: transactionLoading } = useTransaction(id)
  const { mutate: updateTransaction, isPending: updatePending } = useUpdateTransaction()
  const { mutate: deleteTransaction, isPending: deletePending } = useDeleteTransaction()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: accounts } = useAccounts()
  
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [showAccountSelector, setShowAccountSelector] = useState(false)

  const { handleSubmit, register, setValue, watch, formState: { errors } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
  })

  useEffect(() => {
    if (transaction) {
      setValue('amount', transaction.amount)
      setValue('type', transaction.type)
      setValue('category', transaction.category)
      setValue('date', transaction.date)
      setValue('note', transaction.note || '')
      setValue('account_id', transaction.account_id)
      setTransactionType(transaction.type)
    }
  }, [transaction, setValue])

  const currentAmount = watch('amount')
  const selectedCategory = watch('category')
  const selectedAccountId = watch('account_id')
  
  const selectedAccount = accounts?.find(a => a.id === selectedAccountId)

  const handleQuickAdd = (val: number) => {
    setValue('amount', (currentAmount || 0) + val)
  }

  const onSubmit = (data: TransactionFormValues) => {
    if (!id) return
    updateTransaction({ id, data: { ...data, type: transactionType } })
  }

  const handleDelete = () => {
    if (!id) return
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      deleteTransaction(id, {
        onSuccess: () => navigate('/')
      })
    }
  }

  // Filter categories by selected type
  const filteredCategories = categories?.filter(cat => cat.type === transactionType) || []

  if (transactionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface md:flex md:items-center md:justify-center md:p-8">
      {/* 📱 Main Canvas Container */}
      <div className="w-full max-w-[393px] md:max-w-xl bg-surface relative overflow-hidden flex flex-col md:rounded-[3rem] md:shadow-2xl md:h-[852px]">
        
        {/* 🏔️ Header */}
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

        {/* 🎨 Main Content scrolled area */}
        <main className="flex-1 overflow-y-auto px-4 pb-40 no-scrollbar">
          <form id="transaction-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 pt-4">
            
            {/* 💰 Hero Amount Section */}
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
                       step="1000"
                     />
                     <span className="text-headline-sm font-headline text-on-surface-variant">đ</span>
                   </div>
                   {errors.amount && <p className="text-xs text-error font-bold">{errors.amount.message}</p>}
                </div>

                {/* Quick Amount Chips */}
                <div className="flex justify-center gap-2 mt-6 overflow-x-auto no-scrollbar pb-2">
                  {[10, 50, 100, 500].map(val => (
                    <button 
                      key={val}
                      type="button"
                      onClick={() => handleQuickAdd(val * 1000)}
                      className="px-4 py-2 bg-surface-container-high rounded-full font-label text-label-sm text-on-surface-variant hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors flex-shrink-0"
                    >
                      +{val}k đ
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 🔄 Type Toggle */}
            <section>
              <div className="bg-surface-container-high p-1.5 rounded-full flex relative shadow-inner">
                <button 
                  type="button"
                  onClick={() => {
                    setTransactionType('income');
                    setValue('type', 'income');
                  }}
                  className={cn(
                    "flex-1 py-3 rounded-full font-label text-body-md font-black transition-all duration-300",
                    transactionType === 'income' ? "bg-secondary text-white shadow-lg scale-x-[1.02]" : "text-on-surface-variant/60 hover:text-on-surface"
                  )}
                >
                  Thu nhập
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setTransactionType('expense');
                    setValue('type', 'expense');
                  }}
                  className={cn(
                    "flex-1 py-3 rounded-full font-label text-body-md font-black transition-all duration-300",
                    transactionType === 'expense' ? "bg-primary text-white shadow-lg scale-x-[1.02]" : "text-on-surface-variant/60 hover:text-on-surface"
                  )}
                >
                  Chi tiêu
                </button>
              </div>
            </section>

            {/* 📂 Category Grid */}
            <section>
              <div className="flex justify-between items-end mb-4 px-2">
                <h2 className="font-headline text-headline-sm font-bold opacity-80 uppercase tracking-tight text-sm">Danh mục</h2>
              </div>

              {categoriesLoading ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="bg-surface-container-low rounded-3xl p-8 text-center space-y-3 cursor-pointer hover:bg-surface-container-high transition-colors" onClick={() => navigate('/settings/categories/add')}>
                   <Inbox className="w-8 h-8 text-outline-variant mx-auto" />
                   <p className="text-xs text-outline font-bold uppercase tracking-tight">Trống danh mục {transactionType === 'income' ? 'thu nhập' : 'chi tiêu'}</p>
                   <p className="text-[10px] text-primary font-bold">Thêm danh mục mới</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {filteredCategories.map(cat => (
                    <button 
                      key={cat.id}
                      type="button"
                      onClick={() => setValue('category', cat.name)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3.5 rounded-2xl transition-all duration-200 active:scale-[0.9]",
                        selectedCategory === cat.name 
                          ? cn("shadow-xl ring-2", transactionType === 'income' ? "bg-secondary/10 text-secondary ring-secondary/30" : "bg-primary-fixed text-on-primary-fixed ring-primary/30")
                          : "bg-surface-container-low text-on-surface-variant/80 hover:bg-surface-container-high"
                      )}
                    >
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: selectedCategory === cat.name ? "'FILL' 1" : "'FILL' 0" }}>
                        {cat.icon}
                      </span>
                      <span className="font-label text-[10px] font-black tracking-tighter truncate w-full text-center leading-none">{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* 📝 Form Details */}
            <section className="flex flex-col gap-4 mb-20">
              
              {/* Wallet Selector */}
              <div 
                className={cn(
                  "flex items-center gap-4 p-5 rounded-3xl border transition-all cursor-pointer group shadow-sm",
                  selectedAccountId ? "bg-primary/5 border-primary/20" : "bg-surface-container-lowest border-outline-variant/10 hover:bg-surface-container-low"
                )}
                onClick={() => setShowAccountSelector(true)}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", selectedAccountId ? "bg-primary text-on-primary" : "bg-surface-container text-primary")}>
                  <Wallet size={20} />
                </div>
                <div className="flex-1 text-left">
                  <label className="block font-label text-[10px] uppercase font-black text-outline opacity-70 mb-0.5">Tài khoản / Ví</label>
                  <span className={cn("text-body-md font-bold", selectedAccountId ? "text-on-surface" : "text-outline-variant italic")}>
                    {selectedAccount ? selectedAccount.name : 'Chọn một tài khoản...'}
                  </span>
                </div>
                <ChevronRight size={20} className="text-outline-variant group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Date Input */}
              <div className="flex items-center gap-4 bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/10 group cursor-pointer relative shadow-sm hover:bg-surface-container-low transition-colors">
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

              {/* Notes */}
              <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/10 shadow-sm">
                <label className="block font-label text-[10px] uppercase font-black text-outline opacity-70 mb-3">Ghi chú</label>
                <textarea 
                  {...register('note')}
                  className="    w-full 
                      bg-transparent 
                      border-none 
                      p-0 
                      focus:ring-0 
                      min-h-[120px] 
                      text-on-surface
                      placeholder:text-outline-variant/50 
                      font-medium 
                      leading-relaxed" 
                  placeholder="Bạn đã chi tiêu việc gì?..."
                ></textarea>
              </div>
            </section>
          </form>
        </main>

        {/* 🚀 Footer Action */}
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

        {/* 🏦 ACCOUNT SELECTOR DRAWER */}
        {showAccountSelector && (
          <div className="fixed inset-0 z-[100] flex flex-col md:absolute">
             <div className="absolute inset-0 bg-on-background/60 backdrop-blur-md animate-in fade-in" onClick={() => setShowAccountSelector(false)} />
             <div className="mt-auto bg-surface rounded-t-[3rem] p-8 pb-12 relative z-10 animate-in slide-in-from-bottom duration-300 max-h-[80%] overflow-y-auto">
                <div className="w-12 h-1.5 bg-outline-variant/40 rounded-full mx-auto mb-8"></div>
                <div className="flex items-center justify-between mb-8">
                   <h3 className="font-headline font-black text-2xl text-on-surface">Chọn tài khoản</h3>
                   <button onClick={() => setShowAccountSelector(false)} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                     <X size={20} />
                   </button>
                </div>
                <div className="grid gap-4">
                  {accounts?.map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        setValue('account_id', acc.id);
                        setShowAccountSelector(false);
                      }}
                      className={cn(
                        "flex items-center gap-5 p-5 rounded-3xl transition-all active:scale-[0.97] border",
                        selectedAccountId === acc.id ? "bg-primary text-on-primary shadow-lg border-primary" : "bg-surface-container-lowest text-on-surface border-outline-variant/10 hover:bg-surface-container-low"
                      )}
                    >
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", selectedAccountId === acc.id ? "bg-white/20" : "bg-surface-container text-primary shadow-inner")}>
                         <Wallet size={24} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-headline font-bold text-lg leading-tight">{acc.name}</p>
                        <p className={cn("font-label text-xs font-bold opacity-60", selectedAccountId === acc.id ? "text-white" : "text-outline")}>
                          Số dư: {acc.balance?.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                      {selectedAccountId === acc.id && <Check size={18} strokeWidth={3} />}
                    </button>
                  ))}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditTransaction
