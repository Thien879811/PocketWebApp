import React from 'react'

const SummaryBento: React.FC = () => {
  return (
    <section className="grid grid-cols-2 gap-4 mt-8">
      <div className="bg-surface-container-lowest border border-outline-variant/20 p-5 rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-2xl bg-secondary-container/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-secondary">arrow_downward</span>
        </div>
        <div>
          <p className="font-label text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Income</p>
          <p className="text-xl font-bold text-secondary">¥8,200.00</p>
        </div>
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant/20 p-5 rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-2xl bg-error-container/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-error">arrow_upward</span>
        </div>
        <div>
          <p className="font-label text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Expense</p>
          <p className="text-xl font-bold text-error">¥3,120.40</p>
        </div>
      </div>
    </section>
  )
}

export default SummaryBento
