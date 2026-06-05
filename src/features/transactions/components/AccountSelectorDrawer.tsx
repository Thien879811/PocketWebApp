import React from 'react'
import { X, Wallet, Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/format'

interface Account {
  id: string
  name: string
  balance: number
}

interface AccountSelectorDrawerProps {
  open: boolean
  onClose: () => void
  accounts?: Account[]
  selectedId: string | undefined
  onSelect: (id: string) => void
}

export const AccountSelectorDrawer: React.FC<AccountSelectorDrawerProps> = ({
  open,
  onClose,
  accounts,
  selectedId,
  onSelect,
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col md:absolute">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      <div className="mt-auto bg-surface rounded-t-3xl z-10 relative animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-outline-variant/50 rounded-full" />
        </div>

        <div className="px-5 py-4 flex items-center justify-between border-b border-outline-variant/10">
          <h3 className="font-headline font-bold text-lg text-on-surface">Chọn tài khoản</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-surface-container rounded-xl flex items-center justify-center hover:bg-surface-container-high transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-3 pb-8 space-y-2 max-h-[60vh] overflow-y-auto">
          {accounts?.map(acc => {
            const active = selectedId === acc.id
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => { onSelect(acc.id); onClose() }}
                className={cn(
                  'w-full flex items-center gap-3.5 p-4 rounded-2xl transition-all border text-left',
                  active
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface-container-lowest border-outline-variant/20 hover:bg-surface-container'
                )}
              >
                <div className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                  active ? 'bg-white/20' : 'bg-surface-container text-primary'
                )}>
                  <Wallet size={20} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight">{acc.name}</p>
                  <p className={cn('text-xs mt-0.5 font-medium', active ? 'text-white/70' : 'text-on-surface-variant/60')}>
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
  )
}
