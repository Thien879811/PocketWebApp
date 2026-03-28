import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Trash2 } from 'lucide-react'
import { goalSchema, type GoalFormValues } from '../types/goal.schema'
import { useGoal, useUpdateGoal, useDeleteGoal } from '../hooks/useGoals'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ICONS = [
  'flight', 'home', 'directions_car', 'laptop_mac', 'celebration',
  'school', 'fitness_center', 'volunteer_activism', 'medical_services', 'add'
]

const EditGoal: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { data: goal, isLoading: goalLoading } = useGoal(id)
  const { mutate: updateGoal, isPending: updatePending } = useUpdateGoal()
  const { mutate: deleteGoal, isPending: deletePending } = useDeleteGoal()
  
  const [selectedIcon, setSelectedIcon] = useState('flight')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema)
  })

  useEffect(() => {
    if (goal) {
      setValue('name', goal.name)
      setValue('target_amount', goal.target_amount)
      setValue('current_amount', goal.current_amount)
      setValue('target_date', goal.target_date || '')
      setValue('status', goal.status)
      setSelectedIcon(goal.icon)
    }
  }, [goal, setValue])

  useEffect(() => {
    setValue('icon', selectedIcon)
  }, [selectedIcon, setValue])

  const onSubmit = (data: GoalFormValues) => {
    if (!id) return
    updateGoal({ id, data }, {
      onSuccess: () => navigate('/goals')
    })
  }

  const handleDelete = () => {
    if (!id) return
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(id, {
        onSuccess: () => navigate('/goals')
      })
    }
  }

  if (goalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body pb-24 md:p-8 md:flex md:justify-center">
      <div className="w-full max-w-2xl bg-surface relative overflow-hidden flex flex-col md:rounded-[3rem] md:shadow-2xl">
        {/* TopAppBar */}
        <header className="sticky top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-[#f7f9ff]/90 backdrop-blur-md no-line tonal-transition md:rounded-t-[3rem]">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-full active:scale-95">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <span className="text-secondary font-headline font-black tracking-tighter text-2xl italic">PocketFlow</span>
          </div>
          <button 
            type="button" 
            onClick={handleDelete}
            disabled={deletePending}
            className="p-2 text-error hover:bg-error/10 active:scale-95 transition-colors rounded-full disabled:opacity-50"
          >
            {deletePending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pt-6 max-w-2xl mx-auto w-full">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight mb-2">Edit Goal</h1>
            <p className="text-on-surface-variant font-body">Modify your destination or track your progress.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-32">
            
            <section className="space-y-6">
              {/* Goal Name */}
              <div className="space-y-2">
                <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="goal_name">Goal Name</label>
                <div className="relative">
                  <input 
                    {...register('name')}
                    className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 text-lg font-bold focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline font-headline" 
                    id="goal_name" 
                    placeholder="e.g., Tokyo Apartment, New Laptop" 
                    type="text" 
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">
                    <span className="material-symbols-outlined font-light">edit_note</span>
                  </div>
                </div>
                {errors.name && <p className="text-xs text-error font-bold ml-1">{errors.name.message}</p>}
              </div>

              {/* Bento Grid for Financials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Target Amount */}
                <div className="space-y-2">
                  <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="target_amount">Target Amount (VNĐ)</label>
                  <div className="relative">
                    <input 
                      {...register('target_amount', { valueAsNumber: true })}
                      className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 text-lg focus:ring-2 focus:ring-primary/40 transition-all font-mono font-bold" 
                      id="target_amount" 
                      placeholder="0" 
                      type="number" 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-primary font-label text-xs">VNĐ</span>
                  </div>
                  {errors.target_amount && <p className="text-xs text-error font-bold ml-1">{errors.target_amount.message}</p>}
                </div>

                {/* Current Deposit */}
                <div className="space-y-2">
                  <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="current_amount">Current Saved</label>
                  <div className="relative">
                    <input 
                      {...register('current_amount', { valueAsNumber: true })}
                      className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 text-lg focus:ring-2 focus:ring-primary/40 transition-all font-mono font-bold" 
                      id="current_amount" 
                      placeholder="0" 
                      type="number" 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-secondary font-label text-xs">VNĐ</span>
                  </div>
                  {errors.current_amount && <p className="text-xs text-error font-bold ml-1">{errors.current_amount.message}</p>}
                </div>
              </div>

              {/* Target Date */}
              <div className="space-y-2">
                <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="target_date">Target Date</label>
                <div className="relative">
                  <input 
                    {...register('target_date')}
                    className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 text-lg focus:ring-2 focus:ring-primary/40 transition-all font-bold" 
                    id="target_date" 
                    type="date" 
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/40">
                    <span className="material-symbols-outlined">calendar_today</span>
                  </div>
                </div>
              </div>
              
              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="status">Goal Status</label>
                <div className="flex gap-2">
                  {['active', 'completed', 'paused'].map((statusOption) => (
                    <label 
                      key={statusOption}
                      className="flex-1 cursor-pointer"
                    >
                      <input 
                        type="radio" 
                        value={statusOption} 
                        {...register('status')}
                        className="peer hidden" 
                      />
                      <div className={cn(
                        "text-center py-3 rounded-xl border border-outline-variant/20 font-bold text-sm tracking-wide uppercase transition-all",
                        "peer-checked:bg-primary/10 peer-checked:text-primary peer-checked:border-primary peer-checked:shadow-sm"
                      )}>
                        {statusOption}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Icon Selector Grid */}
              <div className="space-y-3">
                <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant ml-1">Choose Icon</label>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-3 p-4 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10">
                  {ICONS.map(icon => (
                    <button 
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={cn(
                        "aspect-square flex items-center justify-center rounded-2xl transition-all transform active:scale-90",
                        selectedIcon === icon 
                          ? "bg-primary/10 text-primary border-2 border-primary/20 scale-105" 
                          : "text-on-surface-variant hover:bg-surface-container border border-transparent"
                      )}
                    >
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: selectedIcon === icon ? "'FILL' 1" : "'FILL' 0" }}>
                        {icon}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Save Action */}
            <div className="pt-6 pb-8">
              <button 
                type="submit"
                disabled={updatePending || deletePending}
                className="w-full bg-[#4A90E2] text-white py-5 px-8 rounded-2xl font-bold font-headline text-lg shadow-[0_8px_30px_rgb(74,144,226,0.3)] hover:shadow-[0_12px_40px_rgb(74,144,226,0.5)] transition-all transform active:scale-[0.98] flex justify-center items-center gap-2"
              >
                {updatePending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}

export default EditGoal
