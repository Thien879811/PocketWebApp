import React from 'react'

const InsightsSection: React.FC = () => {
  return (
    <section className="bg-surface-container-low p-6 rounded-[2rem] flex items-center justify-between mt-8 border border-outline-variant/20">
      <div className="space-y-2 max-w-[50%]">
        <h3 className="text-lg font-bold font-headline leading-tight">Monthly Flow Insight</h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">You've saved 62% of your income this month. Keep it up!</p>
      </div>
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle className="text-surface-container-highest" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
          <circle className="text-primary rounded-full" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="95.4" strokeWidth="8" strokeLinecap="round"></circle>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-lg font-bold font-headline text-on-surface">62%</span>
        </div>
      </div>
    </section>
  )
}

export default InsightsSection
