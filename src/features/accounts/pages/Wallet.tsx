import React, { useState } from 'react'
import { 
  Plus, Landmark, CreditCard, 
  Wallet as WalletIcon, X, Check, Loader2, Landmark as BankIcon, 
  CreditCard as CardIcon, Coins, 
  Sparkles, Trash2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAccounts, useCreateAccount, useDeleteAccount } from '../hooks/useAccounts'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSchema, type AccountFormValues } from '../types/account.schema'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { LoadingSpinner } from '@/components/Loading'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const Wallet: React.FC = () => {
  const { data: accounts, isLoading } = useAccounts()
  const { mutate: createAccount, isPending: isCreating } = useCreateAccount()
  const { mutate: deleteAccount } = useDeleteAccount()
  const [showAddModal, setShowAddModal] = useState(false)

  const handleDeleteAccount = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xoá ví "${name}"? Dữ liệu xoá sẽ không thể khôi phục.`)) {
      deleteAccount(id)
    }
  }

  const { register, handleSubmit, reset, setValue, watch } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { balance: 0, type: 'cash' }
  })

  const selectedType = watch('type')

  const onSubmit = (data: AccountFormValues) => {
    createAccount(data, {
      onSuccess: () => {
        setShowAddModal(false)
        reset()
      }
    })
  }

  // 💰 Total Net Worth Calculation
  const totalNetWorth = accounts?.reduce((acc, curr) => acc + (curr.balance || 0), 0) || 0

  return (
    <div className="max-w-lg mx-auto md:max-w-none pt-4 pb-24 scrollbar-hide">
      
      {/* 🏔️ Net Worth HeroSection */}
      <section className="mb-12 px-2 glass rounded-[2rem] p-8 glass-border dark:shadow-glass-dark">
        <div>
          <p className="font-label text-on-surface-variant text-xs uppercase tracking-[0.2em] font-black mb-3 opacity-60">Tổng tài sản</p>
          <div className="flex items-baseline gap-3">
            <h2 className="font-headline font-black text-4xl tracking-tighter text-on-surface glow">
              {totalNetWorth.toLocaleString('vi-VN')}đ
            </h2>
          </div>
          <p className="text-on-surface-variant text-sm mt-3 opacity-80 italic font-bold">
            Tính toán trên {accounts?.length || 0} tài khoản đang hoạt động
          </p>
        </div>
      </section>

      {/* 💳 Account Cards */}
      {isLoading ? (
        <div className="py-20">
          <LoadingSpinner size="xl" message="Đồng bộ két sắt..." />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-2">
          {accounts?.map((acc) => (
            <div 
              key={acc.id}
              className={cn(
                "relative overflow-hidden p-8 rounded-[2.5rem] min-h-[180px] flex flex-col justify-between glass smooth-transition transform hover:scale-105 active:scale-95 group dark:shadow-glass-dark",
                acc.type === 'bank' ? "dark:shadow-glow-primary" : ""
              )}
            >
              <div className="flex justify-between items-start relative z-10">
                <div className={cn(
                "w-14 h-14 glass rounded-2xl flex items-center justify-center dark:shadow-glass-dark transform group-hover:scale-110 transition-all group-hover:rotate-12 duration-300",
                acc.type === 'bank' ? "text-primary" : 
                acc.type === 'credit' ? "text-error" : 
                "text-secondary"
                )}>
                  {acc.type === 'bank' ? <Landmark size={28} /> : 
                   acc.type === 'credit' ? <CreditCard size={28} /> : 
                   <WalletIcon size={28} />}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteAccount(acc.id!, acc.name)
                  }}
                  className="p-2 -mr-2 bg-transparent opacity-40 hover:opacity-100 hover:text-error hover:bg-error/10 rounded-full transition-all active:scale-95"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="relative z-10 mt-8">
                <div className="flex items-center gap-2 mb-1.5 opacity-80">
                  <h3 className="font-headline font-bold text-lg text-on-surface">{acc.name}</h3>
                  {acc.provider && (
                    <span className={cn(
                      "text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest glass dark:shadow-glass-dark",
                      acc.type === 'bank' ? "text-primary" : "text-on-surface-variant"
                    )}>
                      {acc.provider}
                    </span>
                  )}
                </div>
                <p className="font-headline font-black text-2xl tracking-tight text-on-surface glow">
                  {acc.balance?.toLocaleString('vi-VN')}
                </p>

                {acc.type === 'credit' && acc.limit && (
                   <div className="mt-6">
                      <div className="w-full h-2.5 glass rounded-full overflow-hidden p-0.5 dark:shadow-glass-dark">
                         <div 
                           className="h-full bg-error rounded-full smooth-transition" 
                           style={{ width: `${Math.min((Math.abs(acc.balance) / acc.limit) * 100, 100)}%` }} 
                         />
                      </div>
                      <p className="text-[9px] font-black text-error mt-2 text-right uppercase tracking-[0.1em] opacity-80">
                         Sử dụng {((Math.abs(acc.balance) / acc.limit) * 100).toFixed(1)}% hạn mức
                      </p>
                   </div>
                )}
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="relative border-4 border-dashed border-outline-variant/20 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 text-outline-variant hover:text-primary transition-all active:scale-[0.98] group bg-surface-container-low/30"
          >
             <div className="w-16 h-16 rounded-3xl bg-surface-container flex items-center justify-center">
                <Plus size={32} />
             </div>
             <p className="font-headline font-black text-lg">Thêm ví mới</p>
          </button>
        </div>
      )}

      {/* ✨ Glass Insight */}
      <section className="mt-12 p-8 rounded-[3rem] bg-surface-variant/20 backdrop-blur-3xl border border-white/40 flex gap-6 items-center shadow-sm relative overflow-hidden mx-2 shadow-2xl shadow-on-surface/[0.02]">
        <div className="w-16 h-16 bg-tertiary-container/40 text-on-tertiary-container rounded-[1.5rem] flex-shrink-0 flex items-center justify-center border border-tertiary-container/30 shadow-lg">
          <Sparkles className="w-8 h-8" />
        </div>
        <div>
          <h4 className="font-headline font-black text-xl text-primary mb-1">Sức khỏe tài chính</h4>
          <p className="text-body-md text-on-surface-variant font-semibold leading-relaxed opacity-90">
            Bạn đang quản lý {accounts?.length || 0} nguồn tiền. Phân bổ hợp lý giữa các tài khoản giúp bạn tối ưu chi tiêu và tiết kiệm tốt hơn!
          </p>
        </div>
      </section>

      {/* 🚀 Mobile FAB */}
      <Link 
        to="/add" 
        className="md:hidden fixed bottom-28 right-6 w-16 h-16 bg-primary text-on-primary rounded-[1.5rem] shadow-2xl flex items-center justify-center active:scale-90 transition-all z-40 border-4 border-white/20 shadow-primary/30"
      >
        <Plus size={32} strokeWidth={3} />
      </Link>

      {/* 🏦 ADD ACCOUNT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex flex-col md:absolute">
           <div className="absolute inset-0 bg-on-background/60 backdrop-blur-md animate-in fade-in" onClick={() => !isCreating && setShowAddModal(false)} />
           <div className="mt-auto bg-surface rounded-t-[3rem] p-8 pb-12 relative z-10 animate-in slide-in-from-bottom duration-300 max-h-[90%] overflow-y-auto w-full md:rounded-[2rem] md:mb-auto md:mt-20 md:max-w-md md:mx-auto">
              <div className="w-12 h-1.5 bg-outline-variant/40 rounded-full mx-auto mb-8 md:hidden"></div>
              <div className="flex items-center justify-between mb-10">
                 <h3 className="font-headline font-black text-2xl text-on-surface">Tạo ví mới</h3>
                 <button onClick={() => setShowAddModal(false)} className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors active:scale-90">
                   <X size={24} />
                 </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-3">
                   <p className="font-label text-xs font-black uppercase tracking-widest text-outline opacity-60 ml-2">Loại tài khoản</p>
                   <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'cash', icon: Coins, label: 'Tiền mặt' },
                        { id: 'bank', icon: BankIcon, label: 'Ngân hàng' },
                        { id: 'credit', icon: CardIcon, label: 'Thẻ tín dụng' }
                      ].map(type => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setValue('type', type.id as any)}
                          className={cn(
                            "flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300",
                            selectedType === type.id 
                              ? "bg-primary text-on-primary border-primary shadow-xl scale-[1.05]" 
                              : "bg-surface-container-lowest text-on-surface border-outline-variant/10 hover:bg-surface-container-high"
                          )}
                        >
                          <type.icon size={28} strokeWidth={selectedType === type.id ? 2.5 : 1.5} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-5">
                   <div className="bg-surface-container-low p-5 rounded-3xl border border-outline-variant/10">
                      <label className="block font-label text-[10px] font-black uppercase text-outline opacity-60 mb-1 ml-1">Tên tài khoản</label>
                      <input 
                        {...register('name')}
                        placeholder="VD: Ví cá nhân, Techcombank..."
                        className="w-full bg-transparent border-none p-0 text-lg font-headline font-black focus:ring-0 placeholder:text-outline-variant/50"
                      />
                   </div>

                   <div className="bg-surface-container-low p-5 rounded-3xl border border-outline-variant/10">
                      <label className="block font-label text-[10px] font-black uppercase text-outline opacity-60 mb-1 ml-1">Số dư ban đầu</label>
                      <div className="flex items-center gap-2">
                         <input 
                           {...register('balance', { valueAsNumber: true })}
                           type="number"
                           step="1000"
                           placeholder="0"
                           className="w-full bg-transparent border-none p-0 text-xl font-headline font-black focus:ring-0"
                         />
                         <span className="text-xl font-headline font-black text-primary">đ</span>
                      </div>
                   </div>

                   {selectedType === 'bank' && (
                      <div className="bg-surface-container-low p-5 rounded-3xl border border-outline-variant/10">
                        <label className="block font-label text-[10px] font-black uppercase text-outline opacity-60 mb-1 ml-1">Ngân hàng</label>
                        <input 
                          {...register('provider')}
                          placeholder="VD: VCB, MB, TCB..."
                          className="w-full bg-transparent border-none p-0 text-lg font-headline font-black focus:ring-0 uppercase"
                        />
                      </div>
                   )}
                </div>

                <button 
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-primary text-on-primary h-18 py-5 rounded-[2rem] font-headline font-black text-lg shadow-2xl shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                >
                  {isCreating ? <Loader2 className="animate-spin" /> : (
                    <>
                      <Check size={24} strokeWidth={3} />
                      Lưu tài khoản
                    </>
                  )}
                </button>
              </form>
           </div>
        </div>
      )}

    </div>
  )
}

export default Wallet
