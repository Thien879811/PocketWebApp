import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X, ChevronRight, Calendar, Wallet, Camera, LayoutGrid, Inbox } from 'lucide-react'
import { transactionSchema, type TransactionFormValues } from '../types/transaction.schema'
import { useCreateTransaction } from '../hooks/useCreateTransaction'
import { useCategories } from '../../categories/hooks/useCategories'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const AddTransaction: React.FC = () => {
  const navigate = useNavigate()
  const { mutate: createTransaction, isPending } = useCreateTransaction()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')

  const { handleSubmit, register, setValue, watch, formState: { errors } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      type: 'expense',
      category: '',
      date: new Date().toISOString().split('T')[0],
      note: ''
    }
  })

  const currentAmount = watch('amount')
  const selectedCategory = watch('category')

  const handleQuickAdd = (val: number) => {
    setValue('amount', (currentAmount || 0) + val)
  }

  const onSubmit = (data: TransactionFormValues) => {
    createTransaction({ ...data, type: transactionType })
  }

  // Filter categories by selected type
  const filteredCategories = categories?.filter(cat => cat.type === transactionType) || []

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
          <h1 className="font-headline font-bold text-xl tracking-tight text-primary">New Transaction</h1>
          <div className="w-10 h-10"></div>
        </header>

        {/* 🎨 Main Content */}
        <main className="flex-1 overflow-y-auto px-4 pb-40 no-scrollbar">
          <form id="transaction-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 pt-4">
            
            {/* 💰 Hero Amount Section */}
            <section className="text-center">
              <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-label text-label-sm uppercase tracking-widest text-on-surface-variant">Amount</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-headline-sm font-headline text-on-surface-variant">¥</span>
                    <input 
                      {...register('amount', { valueAsNumber: true })}
                      className="bg-transparent border-none text-display-lg font-headline text-primary focus:ring-0 text-center w-full max-w-[250px]"
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      autoFocus
                    />
                  </div>
                  {errors.amount && <p className="text-xs text-error font-bold">{errors.amount.message}</p>}
                </div>

                {/* Quick Amount Chips */}
                <div className="flex justify-center gap-2 mt-6 overflow-x-auto no-scrollbar pb-2">
                  {[10, 50, 100, 500].map(val => (
                    <button 
                      key={val}
                      type="button"
                      onClick={() => handleQuickAdd(val)}
                      className="px-4 py-2 bg-surface-container-high rounded-full font-label text-label-sm text-on-surface-variant hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors flex-shrink-0"
                    >
                      +¥{val}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 🔄 Type Toggle */}
            <section>
              <div className="bg-surface-container-high p-1.5 rounded-full flex relative">
                <button 
                  type="button"
                  onClick={() => {
                    setTransactionType('income');
                    setValue('type', 'income');
                  }}
                  className={cn(
                    "flex-1 py-2.5 rounded-full font-label text-body-md font-bold transition-all",
                    transactionType === 'income' ? "bg-secondary text-white shadow-md" : "text-on-surface-variant hover:bg-surface-bright"
                  )}
                >
                  Income
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setTransactionType('expense');
                    setValue('type', 'expense');
                  }}
                  className={cn(
                    "flex-1 py-2.5 rounded-full font-label text-body-md font-bold transition-all",
                    transactionType === 'expense' ? "bg-primary text-white shadow-md" : "text-on-surface-variant hover:bg-surface-bright"
                  )}
                >
                  Expense
                </button>
              </div>
            </section>

            {/* 📂 Category Grid */}
            <section>
              <div className="flex justify-between items-end mb-4 px-2">
                <h2 className="font-headline text-headline-sm">Category</h2>
                <button 
                  type="button" 
                  onClick={() => navigate('/settings/categories')}
                  className="text-primary text-xs font-bold hover:underline"
                >
                  Manage
                </button>
              </div>

              {categoriesLoading ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="bg-surface-container-low rounded-3xl p-8 text-center space-y-3 cursor-pointer hover:bg-surface-container-high transition-colors" onClick={() => navigate('/settings/categories/add')}>
                   <Inbox className="w-8 h-8 text-outline-variant mx-auto" />
                   <p className="text-xs text-outline font-bold uppercase tracking-tight">No {transactionType} categories found</p>
                   <p className="text-[10px] text-primary font-bold">Tap to add your first category</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {filteredCategories.map(cat => (
                    <button 
                      key={cat.id}
                      type="button"
                      onClick={() => setValue('category', cat.name)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-[0.9]",
                        selectedCategory === cat.name 
                          ? cn("shadow-sm", transactionType === 'income' ? "bg-secondary/10 text-secondary" : "bg-primary-fixed text-on-primary-fixed")
                          : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                      )}
                    >
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: selectedCategory === cat.name ? "'FILL' 1" : "'FILL' 0" }}>
                        {cat.icon}
                      </span>
                      <span className="font-label text-[10px] font-bold tracking-tight truncate w-full text-center">{cat.name}</span>
                    </button>
                  ))}
                  
                  {/* Plus button for new category */}
                  <button 
                    type="button"
                    onClick={() => navigate('/settings/categories/add')}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-surface-container-highest/20 border-2 border-dashed border-outline-variant/30 text-outline-variant hover:text-primary transition-all"
                  >
                    <LayoutGrid className="w-6 h-6" />
                    <span className="font-label text-[10px] font-bold tracking-tight">New</span>
                  </button>
                </div>
              )}
              {errors.category && <p className="text-xs text-error font-bold mt-2 px-2">{errors.category.message}</p>}
            </section>

            {/* 📝 Form Details */}
            <section className="flex flex-col gap-4">
              {/* Date Input */}
              <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 group cursor-pointer relative">
                <Calendar className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <label className="block font-label text-[10px] uppercase text-outline mb-0.5">Date</label>
                  <input 
                    {...register('date')}
                    type="date"
                    className="w-full bg-transparent border-none p-0 text-body-md font-bold focus:ring-0"
                  />
                </div>
              </div>

              {/* Wallet Selector Mock */}
              <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10">
                <Wallet className="w-5 h-5 text-primary" />
                <div className="flex-1 text-left">
                  <label className="block font-label text-[10px] uppercase text-outline mb-0.5">Wallet / Account</label>
                  <span className="text-body-md font-bold text-on-surface">Main Savings Account</span>
                </div>
                <ChevronRight className="w-5 h-5 text-outline-variant" />
              </div>

              {/* Notes */}
              <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/10">
                <label className="block font-label text-[10px] uppercase text-outline mb-2">Note</label>
                <textarea 
                  {...register('note')}
                  className="w-full bg-transparent border-none p-0 text-body-md focus:ring-0 min-h-[100px] placeholder:text-outline-variant font-medium leading-relaxed" 
                  placeholder="Add details about this transaction..."
                ></textarea>
              </div>

              {/* Photo Receipt Mock */}
              <div className="relative group cursor-pointer">
                <div className="w-full h-36 border-2 border-dashed border-outline-variant/40 rounded-3xl flex flex-col items-center justify-center gap-2 text-outline-variant hover:border-primary-container hover:text-primary transition-all bg-white/50 backdrop-blur-sm">
                  <Camera className="w-8 h-8" />
                  <span className="font-label text-label-sm font-bold">Add Receipt Photo</span>
                </div>
              </div>
            </section>
          </form>
        </main>

        {/* 🚀 Footer Action */}
        <footer className="absolute bottom-0 w-full p-6 bg-surface/80 backdrop-blur-xl z-20 border-t border-white/20">
          <button 
            type="submit"
            form="transaction-form"
            disabled={isPending}
            className="w-full bg-primary text-on-primary py-4 rounded-2xl font-headline font-extra-bold text-lg shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save Transaction'}
          </button>
          
          {/* Mobile indicator spacer */}
          <div className="h-6 md:hidden"></div>
        </footer>

      </div>
    </div>
  )
}

export default AddTransaction
