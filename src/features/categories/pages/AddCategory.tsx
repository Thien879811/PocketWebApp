import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Bell, ArrowDown, ArrowUp, Loader2 } from 'lucide-react'
import { categorySchema, type CategoryFormValues } from '../types/category.schema'
import { useCreateCategory } from '../hooks/useCategories'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ICONS = [
  // Food & Drink
  'restaurant', 'lunch_dining', 'local_cafe', 'liquor', 'bakery_dining', 'icecream',
  // Transport
  'directions_car', 'commute', 'subway', 'local_taxi', 'electric_bike',
  // Home
  'home', 'house', 'water_drop', 'electric_bolt', 'wifi', 'cleaning_services',
  // Entertainment
  'sports_esports', 'videogame_asset', 'stadium', 'theater_comedy', 'movie', 'casino',
  // Health
  'health_and_safety', 'medical_services', 'medication', 'spa', 'vaccines',
  // Shopping
  'shopping_bag', 'shopping_cart', 'local_mall', 'checkroom', 'favorite',
  // Education
  'school', 'book', 'menu_book', 'language',
  // Travel
  'flight', 'hotel', 'beach_access', 'train',
  // Work & Finance
  'work', 'receipt_long', 'credit_card', 'account_balance', 'savings', 'payments',
  // Personal & Misc
  'fitness_center', 'pets', 'child_care', 'person', 'redeem', 'celebration', 'build', 'more_horiz'
]

const COLORS = [
  { name: 'Primary', class: 'bg-primary' },
  { name: 'Secondary', class: 'bg-secondary' },
  { name: 'Rose', class: 'bg-rose-500' },
  { name: 'Pink', class: 'bg-pink-500' },
  { name: 'Fuchsia', class: 'bg-fuchsia-500' },
  { name: 'Purple', class: 'bg-purple-500' },
  { name: 'Violet', class: 'bg-violet-500' },
  { name: 'Indigo', class: 'bg-indigo-500' },
  { name: 'Blue', class: 'bg-blue-500' },
  { name: 'Sky', class: 'bg-sky-500' },
  { name: 'Cyan', class: 'bg-cyan-500' },
  { name: 'Teal', class: 'bg-teal-500' },
  { name: 'Emerald', class: 'bg-emerald-500' },
  { name: 'Green', class: 'bg-green-500' },
  { name: 'Lime', class: 'bg-lime-500' },
  { name: 'Yellow', class: 'bg-yellow-400' },
  { name: 'Amber', class: 'bg-amber-500' },
  { name: 'Orange', class: 'bg-orange-500' },
  { name: 'Stone', class: 'bg-stone-500' },
  { name: 'Slate', class: 'bg-slate-600' },
]

const AddCategory: React.FC = () => {
  const navigate = useNavigate()
  const { mutate: createCategory, isPending } = useCreateCategory()
  const [selectedIcon, setSelectedIcon] = useState('home')
  const [selectedColor, setSelectedColor] = useState('bg-primary')
  const [type, setType] = useState<'income' | 'expense' | 'withdrawal'>('expense')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: 'home',
      type: 'expense',
      color: 'bg-primary',
      limit: undefined
    }
  })

  const categoryName = watch('name')

  const onSubmit = (data: CategoryFormValues) => {
    createCategory(data, {
      onSuccess: () => navigate('/settings/categories')
    })
  }

  useEffect(() => {
    setValue('icon', selectedIcon)
    setValue('type', type)
    setValue('color', selectedColor)
  }, [selectedIcon, type, selectedColor, setValue])

  return (
    <div className="min-h-screen bg-surface font-body text-on-background md:flex md:items-center md:justify-center md:p-8">
      {/* 📱 Main Canvas Container */}
      <div className="w-full max-w-[393px] md:max-w-2xl bg-surface relative overflow-hidden flex flex-col md:rounded-[3rem] md:shadow-2xl md:h-[852px]">
        
        {/* 🏔️ TopAppBar */}
        <nav className="sticky top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#edf4ff] dark:bg-slate-900 border-none">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center justify-center p-2 rounded-full hover:bg-surface-container transition-colors active:scale-95 duration-200 text-primary"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="font-headline font-bold text-xl tracking-tight text-primary">Add Category</h1>
          </div>
          <button className="flex items-center justify-center p-2 rounded-full hover:bg-surface-container transition-colors active:scale-95 text-primary">
            <Bell className="w-5 h-5" />
          </button>
        </nav>

        {/* 🎨 Main Content */}
        <main className="flex-1 overflow-y-auto px-6 pt-8 pb-32 no-scrollbar space-y-10">
          
          {/* Identity Section */}
          <section className="space-y-4">
            <label className="font-headline font-bold text-lg text-on-surface">Category Identity</label>
            <div className="glass rounded-2xl p-1.5 dark:shadow-glass-dark">
              <input 
                {...register('name')}
                className="w-full glass border-none rounded-xl px-6 py-4 text-lg font-body focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-on-surface-variant/50 font-medium dark:shadow-glass-dark smooth-transition" 
                placeholder="Enter Category Name" 
                type="text"
              />
            </div>
            {errors.name && <p className="text-xs text-error font-bold px-2">{errors.name.message}</p>}
          </section>

          {/* Type Selector */}
          <section className="space-y-4">
            <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Transaction Type</span>
            <div className="flex p-1.5 glass rounded-2xl gap-2 dark:shadow-glass-dark">
              <button 
                type="button"
                onClick={() => setType('income')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold smooth-transition active:scale-95 transform hover:scale-105",
                  type === 'income' ? "glass dark:shadow-glow-primary text-secondary" : "bg-surface-container-highest text-on-surface-variant dark:hover:shadow-glass-dark"
                )}
              >
                <ArrowDown className="w-4 h-4" />
                <span>Income</span>
              </button>
              <button 
                type="button"
                onClick={() => setType('expense')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold smooth-transition active:scale-95 transform hover:scale-105",
                  type === 'expense' ? "glass dark:shadow-glow-primary text-error" : "bg-surface-container-highest text-on-surface-variant dark:hover:shadow-glass-dark"
                )}
              >
                <ArrowUp className="w-4 h-4" />
                <span>Expense</span>
              </button>
              <button 
                type="button"
                onClick={() => setType('withdrawal')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold smooth-transition active:scale-95 transform hover:scale-105",
                  type === 'withdrawal' ? "glass dark:shadow-glow-primary text-amber-600" : "bg-surface-container-highest text-on-surface-variant dark:hover:shadow-glass-dark"
                )}
              >
                <ArrowUp className="w-4 h-4 opacity-0" />
                <span>Withdrawal</span>
              </button>
            </div>
          </section>

          {/* Icon Section */}
          <section className="space-y-6">
            <div className="flex justify-between items-end px-1">
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Select Icon</span>
              <span className="text-primary text-xs font-bold hover:underline cursor-pointer">View All</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {ICONS.map(icon => (
                <button 
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={cn(
                    "aspect-square flex items-center justify-center rounded-2xl smooth-transition active:scale-90 transform hover:scale-110",
                    selectedIcon === icon 
                      ? "glass dark:shadow-glow-primary text-primary" 
                      : "glass text-on-surface-variant dark:hover:shadow-glass-dark hover:bg-surface-container/50"
                  )}
                >
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: selectedIcon === icon ? "'FILL' 1" : "'FILL' 0" }}>
                    {icon}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Color Section */}
          <section className="space-y-6">
            <span className="font-label text-xs uppercase tracking-widest text-outline font-bold px-1">Theme Color</span>
            <div className="flex flex-wrap gap-4 px-1">
              {COLORS.map(color => (
                <button 
                  key={color.class}
                  type="button"
                  onClick={() => setSelectedColor(color.class)}
                  className={cn(
                    "w-10 h-10 rounded-full transition-transform hover:scale-110 active:scale-90",
                    color.class,
                    selectedColor === color.class ? "ring-4 ring-offset-2 ring-primary/30" : ""
                  )}
                ></button>
              ))}
            </div>
          </section>

          {/* Monthly Limit Section */}
          <section className={cn("space-y-4 smooth-transition duration-300", type === 'income' || type === 'withdrawal' ? "opacity-0 h-0 overflow-hidden" : "opacity-100")}>
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

          {/* Preview Card */}
          <section className="pt-4">
            <div className="glass rounded-3xl p-6 flex items-center justify-between glass-border dark:shadow-glass-dark">
              <div className="flex items-center gap-4">
                <div className={cn("w-14 h-14 glass rounded-2xl flex items-center justify-center text-primary transform hover:rotate-12 hover:scale-110 transition-all duration-300 dark:shadow-glass-dark", selectedColor)}>
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{selectedIcon}</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-on-surface text-lg leading-tight">{categoryName || 'New Category'}</p>
                  <p className="font-body text-xs text-on-surface-variant font-semibold tracking-wide uppercase opacity-70">
                    {type === 'income' ? 'Revenue Stream' : type === 'expense' ? 'Expense Center' : 'Account Transfer'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-headline font-black text-on-surface text-xl glow">¥0.00</p>
              </div>
            </div>
          </section>
        </main>

        {/* 🚀 Save Action */}
        <footer className="absolute bottom-0 left-0 w-full p-6 glass/80 backdrop-blur-xl border-t border-white/20 z-50 dark:shadow-glass-dark">
          <button 
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="w-full glass text-primary font-headline font-extra-bold text-lg py-5 rounded-2xl dark:shadow-glow-primary smooth-transition active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 transform hover:scale-102"
          >
            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save Category'}
          </button>
        </footer>

      </div>
    </div>
  )
}

export default AddCategory
