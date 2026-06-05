import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Bell, Loader2 } from 'lucide-react'
import { categorySchema, type CategoryFormValues } from '../types/category.schema'
import { useCreateCategory } from '../hooks/useCategories'
import { type TransactionType } from '@/types/transaction.types'
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/constants/categorySelectors'
import { IconSelectorGrid } from '@/components/shared/IconSelectorGrid'
import { ColorSelectorGrid } from '@/components/shared/ColorSelectorGrid'
import { TransactionTypeSelector } from '@/components/shared/TransactionTypeSelector'

const AddCategory: React.FC = () => {
  const navigate = useNavigate()
  const { mutate: createCategory, isPending } = useCreateCategory()
  const [selectedIcon, setSelectedIcon] = useState('home')
  const [selectedColor, setSelectedColor] = useState('bg-primary')
  const [type, setType] = useState<TransactionType>('expense')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: 'home',
      type: 'expense',
      color: 'bg-primary',
      limit: undefined
    }
  })

  useEffect(() => {
    setValue('icon', selectedIcon)
    setValue('type', type)
    setValue('color', selectedColor)
  }, [selectedIcon, type, selectedColor, setValue])

  const onSubmit = (data: CategoryFormValues) => {
    createCategory(data, {
      onSuccess: () => navigate('/settings/categories')
    })
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-background md:flex md:items-center md:justify-center md:p-8">
      <div className="w-full max-w-[393px] md:max-w-2xl bg-surface relative overflow-hidden flex flex-col md:rounded-[3rem] md:shadow-2xl md:h-[852px]">

        {/* TopAppBar */}
        <nav className="sticky top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#edf4ff] dark:bg-slate-900 border-none">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center p-2 rounded-full hover:bg-surface-container transition-colors active:scale-95 duration-200 text-primary"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="font-headline font-bold text-xl tracking-tight text-primary">Thêm danh mục</h1>
          </div>
          <button className="flex items-center justify-center p-2 rounded-full hover:bg-surface-container transition-colors active:scale-95 text-primary">
            <Bell className="w-5 h-5" />
          </button>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 pt-8 pb-32 no-scrollbar space-y-10">

          {/* Name */}
          <section className="space-y-4">
            <label className="font-headline font-bold text-lg text-on-surface">Tên danh mục</label>
            <div className="glass rounded-2xl p-1.5 dark:shadow-glass-dark">
              <input
                {...register('name')}
                className="w-full glass border-none rounded-xl px-6 py-4 text-lg font-body focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-on-surface-variant/50 font-medium dark:shadow-glass-dark smooth-transition"
                placeholder="Nhập tên danh mục"
                type="text"
              />
            </div>
            {errors.name && <p className="text-xs text-error font-bold px-2">{errors.name.message}</p>}
          </section>

          {/* Type */}
          <section className="space-y-4">
            <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Loại giao dịch</span>
            <TransactionTypeSelector value={type} onChange={setType} />
          </section>

          {/* Icon */}
          <section className="space-y-4">
            <div className="flex justify-between items-end px-1">
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Chọn biểu tượng</span>
            </div>
            <IconSelectorGrid
              icons={CATEGORY_ICONS}
              selected={selectedIcon}
              onSelect={setSelectedIcon}
              gridClass="grid-cols-4"
            />
          </section>

          {/* Color */}
          <section className="space-y-4">
            <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Màu danh mục</span>
            <ColorSelectorGrid
              colors={CATEGORY_COLORS}
              selected={selectedColor}
              onSelect={setSelectedColor}
            />
          </section>

          {/* Limit */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Hạn mức tháng</span>
              <span className="text-[10px] text-on-surface-variant/60 italic font-medium">Tùy chọn</span>
            </div>
            <div className="glass rounded-2xl p-1.5 dark:shadow-glass-dark">
              <input
                {...register('limit', { valueAsNumber: true })}
                className="w-full glass border-none rounded-xl px-6 py-4 text-lg font-headline font-bold focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-on-surface-variant/30 dark:shadow-glass-dark"
                placeholder="0"
                type="number"
              />
            </div>
          </section>

        </main>

        {/* Action Bar */}
        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-surface via-surface to-transparent">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="w-full h-16 bg-primary text-on-primary rounded-3xl font-headline font-black text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all dark:shadow-glow-primary"
          >
            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Tạo danh mục'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default AddCategory
