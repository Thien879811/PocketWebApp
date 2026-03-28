import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { goalSchema, type GoalFormValues } from '../types/goal.schema'
import { useCreateGoal } from '../hooks/useGoals'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ICONS = [
  'flight', 'home', 'directions_car', 'laptop_mac', 'celebration',
  'school', 'fitness_center', 'volunteer_activism', 'medical_services', 'add'
]

const COLORS = [
  'bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-error', 'bg-[#f39c12]'
]

const AddGoal: React.FC = () => {
  const navigate = useNavigate()
  const { mutate: createGoal, isPending } = useCreateGoal()
  const [selectedIcon, setSelectedIcon] = useState('flight')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      target_amount: '' as unknown as number,
      current_amount: '' as unknown as number,
      target_date: '',
      icon: 'flight',
      status: 'active',
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }
  })

  useEffect(() => {
    setValue('icon', selectedIcon)
  }, [selectedIcon, setValue])

  const onSubmit = (data: GoalFormValues) => {
    createGoal(data, {
      onSuccess: () => navigate('/goals')
    })
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
        </header>

        <main className="flex-1 overflow-y-auto px-6 pt-6 max-w-2xl mx-auto w-full">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight mb-2">Create New Goal</h1>
            <p className="text-on-surface-variant font-body">Define your path to financial freedom with a bespoke target.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-32">
            
            {/* Hero Insight Card: Visual Motivation */}
            <div className="relative overflow-hidden rounded-[2rem] h-48 mb-10 group shadow-lg">
              <img alt="Motivation" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1554200876-56c2f25224fa?q=80&w=800&auto=format&fit=crop" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-primary/20"></div>
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="text-white">
                  <p className="text-[11px] font-bold font-label uppercase tracking-widest opacity-80 mb-1">Your Future Self</p>
                  <h2 className="text-2xl font-headline font-bold leading-tight">Every transaction saved is<br />freedom earned.</h2>
                </div>
              </div>
            </div>

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

                {/* Initial Deposit */}
                <div className="space-y-2">
                  <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="current_amount">Initial Deposit</label>
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
            <div className="fixed bottom-0 left-0 w-full p-6 bg-surface/90 backdrop-blur-xl border-t border-white/20 z-40 md:absolute md:rounded-b-[3rem]">
              <button 
                type="submit"
                disabled={isPending}
                className="w-full bg-[#4A90E2] text-white py-5 px-8 rounded-2xl font-bold font-headline text-lg shadow-[0_8px_30px_rgb(74,144,226,0.3)] hover:shadow-[0_12px_40px_rgb(74,144,226,0.5)] transition-all transform active:scale-[0.98] flex justify-center items-center gap-2"
              >
                {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Goal'}
              </button>
              <p className="text-center mt-4 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest md:hidden">You can edit these details anytime.</p>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}

export default AddGoal
