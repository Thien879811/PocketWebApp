import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet, Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/format'
import { fadeVariants, drawerBottomVariants, EASE_OUT, DURATION } from '@/lib/motion'

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
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex flex-col md:absolute">

          {/* Backdrop */}
          <motion.div
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet panel */}
          <motion.div
            variants={drawerBottomVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mt-auto bg-surface rounded-t-3xl z-10 relative"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-outline-variant/50 rounded-full" />
            </div>

            <div className="px-5 py-4 flex items-center justify-between border-b border-outline-variant/10">
              <h3 className="font-headline font-bold text-lg text-on-surface">Chọn tài khoản</h3>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: DURATION.fast, ease: EASE_OUT }}
                className="w-8 h-8 bg-surface-container rounded-xl flex items-center justify-center hover:bg-surface-container-high transition-colors"
              >
                <X size={16} />
              </motion.button>
            </div>

            <div className="px-5 py-3 pb-8 space-y-2 max-h-[60vh] overflow-y-auto">
              {accounts?.map((acc, idx) => {
                const active = selectedId === acc.id
                return (
                  <motion.button
                    key={acc.id}
                    type="button"
                    onClick={() => { onSelect(acc.id); onClose() }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: idx * 0.04,
                      duration: DURATION.normal,
                      ease: EASE_OUT,
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'w-full flex items-center gap-3.5 p-4 rounded-2xl transition-colors border text-left',
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
                    {active && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.15, ease: EASE_OUT }}
                      >
                        <Check size={16} className="flex-shrink-0" strokeWidth={2.5} />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
