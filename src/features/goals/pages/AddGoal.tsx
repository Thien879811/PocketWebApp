import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { goalSchema, type GoalFormValues } from '../types/goal.schema'
import { useCreateGoal } from '../hooks/useGoals'
import { GOAL_ICONS, CATEGORY_COLORS } from '@/constants/categorySelectors'
import { IconSelectorGrid } from '@/components/shared/IconSelectorGrid'

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
      color: CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)].class
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
        <header className="sticky top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-[#f7f9ff]/90 backdrop-blur-md md:rounded-t-[3rem]">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-full active:scale-95">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <span className="text-secondary font-headline font-black tracking-tighter text-2xl italic">PocketFlow</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pt-6 max-w-2xl mx-auto w-full">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight mb-2">Tạo mục tiêu</h1>
            <p className="text-on-surface-variant font-body">Xác định con đường tự do tài chính của bạn.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-32">

            {/* Hero Image */}
            <div className="relative overflow-hidden rounded-[2rem] h-48 mb-10 group shadow-lg">
              <img
                alt="Motivation"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://images.unsplash.com/photo-1554200876-56c2f25224fa?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-primary/20" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[11px] font-bold font-label uppercase tracking-widest text-white/80 mb-1">Tương lai của bạn</p>
                <h2 className="text-2xl font-headline font-bold text-white leading-tight">Mỗi khoản tiết kiệm là<br />một bước tự do.</h2>
              </div>
            </div>

            <section className="space-y-6">

              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="goal_name">Tên mục tiêu</label>
                <div className="relative">
                  <input
                    {...register('name')}
                    className="w-full glass border-none rounded-2xl py-4 px-5 text-lg font-bold focus:ring-2 focus:ring-primary/40 smooth-transition placeholder:text-on-surface-variant/50 font-headline dark:shadow-glass-dark"
                    id="goal_name"
                    placeholder="VD: Mua xe, Du lịch Nhật..."
                    type="text"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">
                    <span className="material-symbols-outlined font-light">edit_note</span>
                  </div>
                </div>
                {errors.name && <p className="text-xs text-error font-bold ml-1">{errors.name.message}</p>}
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="target_amount">Số tiền mục tiêu (VNĐ)</label>
                  <div className="relative">
                    <input
                      {...register('target_amount', { valueAsNumber: true })}
                      className="w-full glass border-none rounded-2xl py-4 px-5 text-lg focus:ring-2 focus:ring-primary/40 smooth-transition font-mono font-bold dark:shadow-glass-dark"
                      id="target_amount"
                      placeholder="0"
                      type="number"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-primary font-label text-xs">VNĐ</span>
                  </div>
                  {errors.target_amount && <p className="text-xs text-error font-bold ml-1">{errors.target_amount.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="current_amount">Số tiền hiện có</label>
                  <div className="relative">
                    <input
                      {...register('current_amount', { valueAsNumber: true })}
                      className="w-full glass border-none rounded-2xl py-4 px-5 text-lg focus:ring-2 focus:ring-primary/40 smooth-transition font-mono font-bold dark:shadow-glass-dark"
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
                <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="target_date">Ngày mục tiêu</label>
                <div className="relative">
                  <input
                    {...register('target_date')}
                    className="w-full glass border-none rounded-2xl py-4 px-5 text-lg focus:ring-2 focus:ring-primary/40 smooth-transition font-bold dark:shadow-glass-dark"
                    id="target_date"
                    type="date"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/40">
                    <span className="material-symbols-outlined">calendar_today</span>
                  </div>
                </div>
              </div>

              {/* Icon Selector */}
              <div className="space-y-3">
                <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant ml-1">Chọn biểu tượng</label>
                <div className="p-4 glass rounded-2xl dark:shadow-glass-dark">
                  <IconSelectorGrid
                    icons={GOAL_ICONS}
                    selected={selectedIcon}
                    onSelect={setSelectedIcon}
                    gridClass="grid-cols-5 md:grid-cols-10"
                    iconSize="text-3xl"
                    fillSelected
                  />
                </div>
              </div>

            </section>

            {/* Submit */}
            <div className="pt-6 pb-8">
              <button
                type="submit"
                disabled={isPending}
                className="w-full glass text-primary py-5 px-8 rounded-2xl font-bold font-headline text-lg dark:shadow-glow-primary smooth-transition transform hover:scale-102 active:scale-[0.98] flex justify-center items-center gap-2"
              >
                {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Tạo mục tiêu'}
              </button>
              <p className="text-center mt-4 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest md:hidden">Bạn có thể chỉnh sửa sau.</p>
            </div>

          </form>
        </main>
      </div>
    </div>
  )
}

export default AddGoal
