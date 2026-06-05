import { formatCurrency } from '@/utils/format'
import { LoadingScreen } from '@/components/Loading'
import React from 'react'
import { Plus, Target } from 'lucide-react'
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

  if (isLoading) return <LoadingScreen message="Đang tải mục tiêu..." />

  const activeGoals = goals || []
  const totalSaved = activeGoals.reduce((sum, g) => sum + g.current_amount, 0)
  const totalTarget = activeGoals.reduce((sum, g) => sum + g.target_amount, 0)
  const overallPct = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0

  return (
    <div className="max-w-xl mx-auto md:max-w-none space-y-5 pb-8">

      {/* ── Title ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
          Mục tiêu
        </h1>
        <button
          onClick={() => navigate('/goals/add')}
          className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm shadow-primary/30 hover:brightness-105 active:scale-95 transition-all"
        >
          <Plus size={14} strokeWidth={2.5} />
          Thêm mục tiêu
        </button>
      </div>

      {/* ── Overview Card ────────────────────────── */}
      <div className="bg-gradient-to-br from-primary to-[#3b5cf6] rounded-2xl p-6 text-white relative overflow-hidden shadow-elevated shadow-primary/25">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/8 rounded-full pointer-events-none" />

        <div className="relative z-10">
          <p className="text-xs text-white/70 font-medium uppercase tracking-wider mb-1">
            Tổng tích lũy
          </p>
          <h2 className="text-3xl font-headline font-bold tracking-tight">
            {formatCurrency(totalSaved)}
          </h2>

          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-white/70">
              <span>{Math.round(overallPct)}% mục tiêu</span>
              <span>Mục tiêu: {formatCurrency(totalTarget)}</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-4 text-xs text-white/80">
            <Target size={13} />
            <span>
              {activeGoals.length} mục tiêu đang theo dõi
            </span>
          </div>
        </div>
      </div>

      {/* ── Goals Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeGoals.map((goal) => {
          const pct = goal.target_amount > 0
            ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
            : 0

          const statusColors: Record<string, string> = {
            active: 'bg-primary/10 text-primary',
            completed: 'bg-secondary/10 text-secondary',
            paused: 'bg-amber-500/10 text-amber-500',
          }

          return (
            <div
              key={goal.id}
              onClick={() => navigate(`/goals/edit/${goal.id}`)}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 cursor-pointer hover:border-primary/30 hover:shadow-card transition-all active:scale-[0.98] shadow-card group"
            >
              {/* Icon + percent */}
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center",
                  goal.color || "bg-primary/10"
                )}>
                  <span
                    className="material-symbols-outlined text-[22px] text-white"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {goal.icon}
                  </span>
                </div>
                <span className={cn(
                  "text-xs font-bold px-2.5 py-1 rounded-full",
                  statusColors[goal.status] || 'bg-surface-container text-on-surface-variant'
                )}>
                  {pct}%
                </span>
              </div>

              {/* Name + date */}
              <h3 className="font-headline font-bold text-base text-on-surface leading-tight mb-0.5">
                {goal.name}
              </h3>
              <p className="text-[11px] text-on-surface-variant/60 font-medium mb-4">
                {goal.target_date
                  ? `Hạn: ${new Date(goal.target_date).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}`
                  : 'Không có hạn'}
              </p>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-on-surface">{formatCurrency(goal.current_amount)}</span>
                  <span className="text-on-surface-variant/60">{formatCurrency(goal.target_amount)}</span>
                </div>
                <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      goal.color || "bg-primary"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}

        {/* Add new card */}
        <button
          onClick={() => navigate('/goals/add')}
          className="bg-surface-container-lowest rounded-2xl border-2 border-dashed border-outline-variant/30 p-5 flex flex-col items-center justify-center gap-2.5 text-center hover:border-primary/40 hover:bg-primary/3 transition-all active:scale-[0.98] min-h-[180px] group"
        >
          <div className="w-11 h-11 bg-surface-container rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Plus size={20} className="text-on-surface-variant group-hover:text-primary transition-colors" />
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">Mục tiêu mới</p>
            <p className="text-xs text-on-surface-variant/60 mt-0.5">Bắt đầu kế hoạch tiết kiệm</p>
          </div>
        </button>
      </div>

      {/* FAB mobile */}
      <button
        onClick={() => navigate('/goals/add')}
        className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-primary text-white rounded-2xl shadow-lg shadow-primary/40 flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
    </div>
  )
}

export default Goals
