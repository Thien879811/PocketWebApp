import React from 'react'

const BalanceCard: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-primary-container p-8 text-on-primary shadow-lg mt-6">
      <div className="relative z-10">
        <div className="flex items-center gap-2 opacity-90">
          <span className="text-xs uppercase tracking-widest font-bold">Total Balance</span>
          <span className="material-symbols-outlined text-lg cursor-pointer hover:opacity-100 transition-opacity">visibility</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-medium opacity-80">¥</span>
          <span className="text-5xl font-extrabold tracking-tighter font-headline">12,480.50</span>
        </div>
        <div className="mt-8 flex justify-between items-end">
          <div className="flex -space-x-3">
            <div className="w-10 h-10 rounded-full border-2 border-primary-container bg-surface-container-highest flex items-center justify-center hover:z-10 transition-transform hover:scale-110">
              <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary-container bg-surface-container-highest flex items-center justify-center hover:z-10 transition-transform hover:scale-110">
              <span className="material-symbols-outlined text-primary text-sm">payments</span>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl px-3 py-1 text-xs font-bold">
            +2.4% this month
          </div>
        </div>
      </div>
      {/* Decorative circle */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
    </section>
  )
}

export default BalanceCard
