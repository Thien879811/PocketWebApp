import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Loader2, Trash2 } from 'lucide-react'
import { categorySchema, type CategoryFormValues } from '../types/category.schema'
import { useCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories'
import { type TransactionType } from '@/types/transaction.types'
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/constants/categorySelectors'
import { IconSelectorGrid } from '@/components/shared/IconSelectorGrid'
import { ColorSelectorGrid } from '@/components/shared/ColorSelectorGrid'
import { TransactionTypeSelector } from '@/components/shared/TransactionTypeSelector'
import { cn } from '@/utils/cn'

const EditCategory: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: category, isLoading: categoryLoading } = useCategory(id)
  const { mutate: updateCategory, isPending: updatePending } = useUpdateCategory()
  const { mutate: deleteCategory, isPending: deletePending } = useDeleteCategory()

  const [selectedIcon, setSelectedIcon] = useState('home')
  const [selectedColor, setSelectedColor] = useState('bg-primary')
  const [type, setType] = useState<TransactionType>('expense')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  })

  useEffect(() => {
    if (category) {
      setValue('name', category.name)
      setSelectedIcon(category.icon)
      setSelectedColor(category.color || 'bg-primary')
      setType(category.type as TransactionType)
      setValue('limit', category.limit)
    }
  }, [category, setValue])

  useEffect(() => {
    setValue('icon', selectedIcon)
    setValue('type', type)
    setValue('color', selectedColor)
  }, [selectedIcon, type, selectedColor, setValue])

  const onSubmit = (data: CategoryFormValues) => {
    if (!id) return
    updateCategory({ id, data }, {
      onSuccess: () => navigate('/settings/categories')
    })
  }

  const handleDelete = () => {
    if (!id) return
    if (window.confirm('Bạn có chắc muốn xoá danh mục này?')) {
      deleteCategory(id, {
        onSuccess: () => navigate('/settings/categories')
      })
    }
  }

  if (categoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
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
            <h1 className="font-headline font-bold text-xl tracking-tight text-primary">Sửa danh mục</h1>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center justify-center p-2 rounded-full hover:bg-error/10 text-error transition-colors active:scale-95"
          >
            <Trash2 className="w-5 h-5" />
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

          {/* Monthly Limit */}
          <section className={cn(
            'space-y-4 transition-all duration-300',
            type === 'income' || type === 'withdrawal' ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
          )}>
            <label className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
              Giới hạn tháng
              <span className="text-[10px] glass text-secondary px-2 py-0.5 rounded-full uppercase tracking-widest font-black dark:shadow-glass-dark">Budgeting</span>
            </label>
            <div className="glass p-1.5 rounded-2xl relative group dark:shadow-glass-dark">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant group-focus-within:text-primary smooth-transition">
                payments
              </span>
              <input
                {...register('limit', { valueAsNumber: true })}
                className="w-full glass border-none rounded-xl pl-14 pr-6 py-4 text-lg font-body focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-on-surface-variant/50 font-black italic dark:shadow-glass-dark smooth-transition"
                placeholder="Đặt giới hạn (VNĐ)"
                type="number"
                step="10000"
              />
            </div>
            <p className="text-[10px] text-on-surface-variant font-medium px-2 italic">Hệ thống sẽ cảnh báo khi bạn chi tiêu vượt ngưỡng này.</p>
            {errors.limit && <p className="text-xs text-error font-bold px-2">{errors.limit.message}</p>}
          </section>

        </main>

        {/* Action Bar */}
        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-surface via-surface to-transparent">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={updatePending || deletePending}
            className="w-full h-16 bg-primary text-on-primary rounded-3xl font-headline font-black text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all dark:shadow-glow-primary"
          >
            {updatePending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Lưu thay đổi'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default EditCategory
