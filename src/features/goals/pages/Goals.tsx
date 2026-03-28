import React from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGoals } from '../hooks/useGoals'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const Goals: React.FC = () => {
  const navigate = useNavigate()
  const { data: goals, isLoading } = useGoals()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" strokeWidth={3} />
        <p className="font-headline font-black text-xl tracking-tight">Loading goals...</p>
      </div>
    )
  }

  const activeGoals = goals || []
  const totalSaved = activeGoals.reduce((sum, goal) => sum + goal.current_amount, 0)

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <section className="mb-12">
        <div className="relative overflow-hidden rounded-[2rem] p-8 bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-xl">
          <div className="relative z-10">
            <span className="text-sm font-label opacity-80 tracking-widest uppercase">Overview</span>
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold mt-2 mb-1 tracking-tight">Total Saved</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl md:text-6xl font-headline font-black tracking-tighter">{totalSaved.toLocaleString('vi-VN')}</span>
              <span className="text-2xl font-headline opacity-90 font-bold">VNĐ</span>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
              <span className="text-sm font-bold">Keep the momentum going!</span>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-headline text-2xl font-bold text-on-surface">Active Goals</h3>
          <div className="flex gap-2">
            <span className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-sm font-medium">Monthly</span>
            <span className="px-4 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed text-sm font-semibold">Priority</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {activeGoals.map(goal => {
            const percentage = goal.target_amount > 0 
              ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
              : 0

            return (
              <div key={goal.id} className="bg-surface-container-lowest rounded-[2rem] p-6 transition-all duration-300 hover:shadow-lg group shadow-sm border border-outline-variant/10">
                <div className="flex justify-between items-start mb-6">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", goal.color || "bg-primary/10 text-primary")}>
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{goal.icon}</span>
                  </div>
                  <span className={cn("font-headline font-black text-xl", goal.color ? goal.color.replace('bg-', 'text-') : "text-primary")}>{percentage}%</span>
                </div>
                <h4 className="font-headline text-xl font-bold mb-1">{goal.name}</h4>
                <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-6 opacity-70">
                  Target: {goal.target_date ? new Date(goal.target_date).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }) : 'Ongoing'}
                </p>
                <div className="mb-6">
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-on-surface">{goal.current_amount.toLocaleString('vi-VN')}</span>
                    <span className="text-on-surface-variant opacity-60">{goal.target_amount.toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", goal.color || "bg-primary")} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/goals/edit/${goal.id}`)}
                  className="w-full py-4 rounded-xl bg-surface-container-low text-primary font-bold text-sm group-hover:bg-primary group-hover:text-white transition-colors active:scale-95"
                >
                  View Details
                </button>
              </div>
            )
          })}

          {/* New Goal */}
          <div onClick={() => navigate('/goals/add')} className="relative overflow-hidden rounded-[2rem] p-6 bg-surface-container border-2 border-dashed border-outline-variant/40 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary transition-all min-h-[320px] active:scale-[0.98]">
            <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-all duration-300 mb-4 shadow-sm">
              <span className="material-symbols-outlined text-3xl">add</span>
            </div>
            <h4 className="font-headline text-lg font-bold">New Goal</h4>
            <p className="text-sm text-on-surface-variant mt-1 font-medium opacity-80">Start planning your next milestone</p>
          </div>
        </div>
      </section>

      <section className="mt-16 p-8 rounded-[2rem] bg-surface-container border border-outline-variant/10 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <h3 className="font-headline text-2xl font-bold mb-4">Savings Insight</h3>
            <p className="text-on-surface-variant leading-relaxed font-medium">
              Based on your current transaction history, you're on track to complete your <span className="text-secondary font-bold">"Emergency Fund"</span> 2 months earlier than projected. Consider redirecting some flow to your <span className="text-tertiary font-bold">"Europe Travel"</span> goal.
            </p>
          </div>
          <div className="w-full md:w-auto">
            <div className="p-6 bg-surface-container-lowest rounded-2xl flex items-center gap-6 shadow-md border border-outline-variant/10">
              <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div>
                <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant opacity-80">Efficiency Score</p>
                <p className="text-2xl font-headline font-black text-secondary">Excellent 92%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAB inside content flow to mimic the prompt, but it should be fixed if we want it global. 
          MainLayout already provides a "New Transaction" flow, so we could hook it up later. */}
      <button onClick={() => navigate('/goals/add')} className="md:hidden fixed bottom-28 right-6 w-16 h-16 bg-primary text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center active:scale-95 transition-transform z-50 shadow-primary/40 border-4 border-white">
        <Plus size={32} strokeWidth={3} />
      </button>

    </div>
  )
}

export default Goals
