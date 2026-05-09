import { formatCurrency } from '@/utils/format'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X, ChevronRight, Calendar, Wallet, LayoutGrid, Inbox, Check, AlertTriangle } from 'lucide-react'
import { transactionSchema, type TransactionFormValues } from '../types/transaction.schema'
import { useCreateTransaction } from '../hooks/useTransactionMutations'
import { useCategories } from '../../categories/hooks/useCategories'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import { useActiveBudget, getDailyBudgetStatus } from '../../budget/hooks/useBudget'
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
  const { data: currentPlan } = useActiveBudget()
  const { data: transactions } = useTransactions()
  
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
      account_id: ''
    }
  })

  const currentAmount = watch('amount')
  const selectedCategoryId = watch('category_id')
  const selectedAccountId = watch('account_id')
  
  const selectedAccount = accounts?.find(a => a.id === selectedAccountId)

  const handleQuickAdd = (val: number) => {
    setValue('amount', (currentAmount || 0) + val)
  }

  const onSubmit = (data: TransactionFormValues) => {
    // For withdrawals, set category_id to null if empty
    const submissionData = { ...data, type: transactionType }
    if (transactionType === 'withdrawal' && !data.category_id) {
      // @ts-ignore - Supabase accepts null for category_id
      submissionData.category_id = null
    }
    
    createTransaction(submissionData)
  }

  // Filter categories by selected type
  const filteredCategories = categories?.filter(cat => {
    if (transactionType === 'borrow' || transactionType === 'lend') {
      // Prioritize borrow/lend categories, but allow income/expense for backward compatibility or flexibility
      return cat.type === transactionType || cat.type === 'income' || cat.type === 'expense'
    }
    return cat.type === transactionType
  }) || []

  // Budget checks
  const dateStr = watch('date') || new Date().toISOString().split('T')[0]
  const todayStatus = (currentPlan && transactions) ? getDailyBudgetStatus(currentPlan, transactions, dateStr) : null
  
  const isBudgetEmpty = Boolean(currentPlan && todayStatus?.budgetEmpty && transactionType === 'expense')
  const targetRemaining = isBudgetEmpty ? 0 : (todayStatus?.remainingDaily || 0)
  const willExceed = Boolean(currentPlan && transactionType === 'expense' && (currentAmount || 0) > targetRemaining)
  
  // Vibration effect helper
  React.useEffect(() => {
    if (willExceed && "vibrate" in navigator) {
       navigator.vibrate(200)
    }
  }, [willExceed])

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
          <h1 className="font-headline font-bold text-xl tracking-tight text-primary">Giao dịch mới</h1>
          <div className="w-10 h-10"></div>
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
                      step="any"
                      autoFocus
                    />
                    <span className="text-headline-sm font-headline text-on-surface-variant">đ</span>
                  </div>
                  {errors.amount && <p className="text-xs text-error font-bold">{errors.amount.message}</p>}
                  
                  {/* Budget Warnings UI */}
                  {isBudgetEmpty && (
                    <div className="mt-2 text-xs font-bold text-secondary bg-secondary/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
                       <X className="w-4 h-4" /> Ngân sách kế hoạch đã cạn, bạn vẫn có thể lưu giao dịch.
                    </div>
                  )}
                  {!isBudgetEmpty && willExceed && (
                    <div className="mt-2 text-[10px] font-bold text-error bg-error/10 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                       <AlertTriangle className="w-3.5 h-3.5" /> Giao dịch này sẽ vượt hạn mức {formatCurrency(targetRemaining)}/ngày.
                    </div>
                  )}
                </div>

                {/* Quick Amount Chips */}
                <div className="flex flex-wrap mt-6 justify-center gap-2 pb-2">
                  {[1,2,5,10,20,50,100,200,500].map(val => (
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
              <div className="bg-surface-container-high p-1.5 rounded-full flex relative shadow-inner overflow-x-auto no-scrollbar">
                {(['income', 'expense', 'withdrawal', 'borrow', 'business'] as const).map(typeKey => {
                  const meta = TRANSACTION_TYPES_METADATA[typeKey];
                  const isActive = typeKey === 'borrow' 
                    ? (transactionType === 'borrow' || transactionType === 'lend')
                    : transactionType === typeKey;

                  return (
                    <button 
                      key={typeKey}
                      type="button"
                      onClick={() => {
                        const nextType = typeKey === 'borrow' ? 'borrow' : typeKey;
                        setTransactionType(nextType);
                        setValue('type', nextType);
                        if (typeKey === 'withdrawal') setValue('category_id', '');
                      }}
                      className={cn(
                        "flex-1 py-3 px-2 rounded-full font-label text-[10px] font-black transition-all duration-300 min-w-[70px]",
                        isActive 
                          ? `${meta.badge.split(' ')[0]} ${meta.color} shadow-lg scale-x-[1.02]` 
                          : "text-on-surface-variant/60 hover:text-on-surface"
                      )}
                    >
                      {typeKey === 'borrow' ? 'Mượn/Trả' : meta.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ↕️ Lend/Borrow Sub-toggle */}
            {(transactionType === 'borrow' || transactionType === 'lend') && (
              <section className="animate-in fade-in slide-in-from-top-2">
                <div className="bg-surface-container-high p-1 rounded-2xl flex border border-outline-variant/10">
                  {(['borrow', 'lend'] as const).map(typeKey => {
                    const meta = TRANSACTION_TYPES_METADATA[typeKey];
                    return (
                      <button 
                        key={typeKey}
                        type="button"
                        onClick={() => {
                          setTransactionType(typeKey);
                          setValue('type', typeKey);
                        }}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl font-label text-[10px] font-black transition-all",
                          transactionType === typeKey 
                            ? `${meta.badge.split(' ')[0]} ${meta.color} shadow-sm` 
                            : "text-on-surface-variant/60 hover:text-on-surface"
                        )}
                      >
                        {meta.label} ({meta.prefix})
                      </button>
                    );
                  })}
                </div>
                <p className="text-[9px] text-on-surface-variant/60 font-bold mt-2 px-2 italic text-center">
                  * Giao dịch này chỉ ảnh hưởng ví, không tính vào kế hoạch chi tiêu.
                </p>
              </section>
            )}

            {/* 📂 Category Grid */}
            <section>
              <div className="flex justify-between items-end mb-4 px-2">
                <h2 className="font-headline text-headline-sm font-bold opacity-80 uppercase tracking-tight text-sm">Danh mục</h2>
                <button 
                  type="button" 
                  onClick={() => navigate('/settings/categories')}
                  className="text-primary text-xs font-black hover:underline"
                >
                  Quản lý
                </button>
              </div>

              {categoriesLoading ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="bg-surface-container-low rounded-3xl p-8 text-center space-y-3 cursor-pointer hover:bg-surface-container-high transition-colors" onClick={() => navigate('/settings/categories/add')}>
                   <Inbox className="w-8 h-8 text-outline-variant mx-auto" />
                   <p className="text-xs text-outline font-bold uppercase tracking-tight">Trống danh mục {(transactionType === 'borrow' || transactionType === 'lend') ? 'mượn trả' : transactionType === 'income' ? 'thu nhập' : 'chi tiêu'}</p>
                   <p className="text-[10px] text-primary font-bold">Thêm danh mục mới</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {filteredCategories.map(cat => (
                    <button 
                      key={cat.id}
                      type="button"
                      onClick={() => setValue('category_id', cat.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3.5 rounded-2xl transition-all duration-200 active:scale-[0.9]",
                        selectedCategoryId === cat.id 
                          ? cn("shadow-xl ring-2", (transactionType === 'income' || transactionType === 'borrow') ? "bg-secondary/10 text-secondary ring-secondary/30" : "bg-primary-fixed text-on-primary-fixed ring-primary/30")
                          : "bg-surface-container-low text-on-surface-variant/80 hover:bg-surface-container-high"
                      )}
                    >
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: selectedCategoryId === cat.id ? "'FILL' 1" : "'FILL' 0" }}>
                        {cat.icon}
                      </span>
                      <span className="font-label text-[10px] font-black tracking-tighter truncate w-full text-center leading-none">{cat.name}</span>
                    </button>
                  ))}
                  <button 
                    type="button"
                    onClick={() => navigate('/settings/categories/add')}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-surface-container-highest/10 border-2 border-dashed border-outline-variant/30 text-outline-variant hover:text-primary transition-all active:scale-95"
                  >
                    <LayoutGrid size={24} />
                    <span className="font-label text-[10px] font-bold tracking-tight">Mới</span>
                  </button>
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

              {/* Fee Input for Withdrawals */}
              {transactionType === 'withdrawal' && (
                <div className="flex items-center gap-4 bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/10 group cursor-pointer relative shadow-sm hover:bg-surface-container-low transition-colors">
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
                  className="w-full 
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
            disabled={isPending}
            className="w-full bg-primary text-on-primary h-16 rounded-[1.5rem] font-headline font-black text-lg shadow-2xl shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:active:scale-100 disabled:hover:brightness-100 disabled:cursor-not-allowed"
          >
            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Lưu giao dịch'}
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
                          Số dư: {formatCurrency(acc.balance)}
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

export default AddTransaction
