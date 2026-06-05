import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Trash2 } from 'lucide-react'
import { goalSchema, type GoalFormValues } from '../types/goal.schema'
import { useGoal, useUpdateGoal, useDeleteGoal } from '../hooks/useGoals'
import { GOAL_ICONS } from '@/constants/categorySelectors'
import { IconSelectorGrid } from '@/components/shared/IconSelectorGrid'
import { cn } from '@/utils/cn'

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
    if (window.confirm('Bạn có chắc muốn xoá mục tiêu này?')) {
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
        <header className="sticky top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-[#f7f9ff]/90 backdrop-blur-md md:rounded-t-[3rem]">
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
            <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight mb-2">Sửa mục tiêu</h1>
            <p className="text-on-surface-variant font-body">Điều chỉnh đích đến hoặc theo dõi tiến độ.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-32">
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
                  <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="current_amount">Đã tiết kiệm</label>
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

              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant ml-1">Trạng thái</label>
                <div className="flex gap-2">
                  {(['active', 'completed', 'paused'] as const).map(statusOption => (
                    <label key={statusOption} className="flex-1 cursor-pointer">
                      <input type="radio" value={statusOption} {...register('status')} className="peer hidden" />
                      <div className={cn(
                        'text-center py-3 rounded-xl glass font-bold text-sm tracking-wide uppercase smooth-transition dark:shadow-glass-dark',
                        'peer-checked:dark:shadow-glow-primary peer-checked:text-primary'
                      )}>
                        {statusOption === 'active' ? 'Đang thực hiện' : statusOption === 'completed' ? 'Hoàn thành' : 'Tạm dừng'}
                      </div>
                    </label>
                  ))}
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
                disabled={updatePending || deletePending}
                className="w-full glass text-primary py-5 px-8 rounded-2xl font-bold font-headline text-lg dark:shadow-glow-primary smooth-transition transform hover:scale-102 active:scale-[0.98] flex justify-center items-center gap-2"
              >
                {updatePending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Lưu thay đổi'}
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  )
}

export default EditGoal
