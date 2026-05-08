import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Bell, Loader2 } from 'lucide-react'
import { categorySchema, type CategoryFormValues } from '../types/category.schema'
import { useCreateCategory } from '../hooks/useCategories'
import { TRANSACTION_TYPES_METADATA, type TransactionType } from '@/types/transaction.types'
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
            <div className="grid grid-cols-2 sm:grid-cols-3 p-1.5 glass rounded-2xl gap-2 dark:shadow-glass-dark">
              {(['income', 'expense', 'business', 'withdrawal', 'borrow'] as const).map((key) => {
                const meta = TRANSACTION_TYPES_METADATA[key];
                return (
                  <button 
                    key={key}
                    type="button"
                    onClick={() => setType(key)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-2 rounded-xl font-bold smooth-transition active:scale-95 transform hover:scale-105",
                      type === key ? "glass dark:shadow-glow-primary text-primary" : "bg-surface-container-highest text-on-surface-variant dark:hover:shadow-glass-dark"
                    )}
                  >
                    <span className="material-symbols-outlined text-base">{meta.icon}</span>
                    <span className="text-[10px] sm:text-xs truncate">{meta.shortLabel}</span>
                  </button>
                );
              })}
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
                      : "bg-surface-container-highest text-on-surface-variant/60"
                  )}
                >
                  <span className="material-symbols-outlined text-2xl">{icon}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Color Section */}
          <section className="space-y-6">
            <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Category Color</span>
            <div className="grid grid-cols-5 gap-4">
              {COLORS.map(color => (
                <button 
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color.class)}
                  className={cn(
                    "aspect-square rounded-2xl border-4 transition-all duration-300 transform hover:scale-110 active:scale-90",
                    color.class,
                    selectedColor === color.class ? "border-white shadow-xl scale-110" : "border-transparent opacity-80"
                  )}
                />
              ))}
            </div>
          </section>

          {/* Limit Section (Optional) */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Monthly Limit</span>
              <span className="text-[10px] text-on-surface-variant/60 italic font-medium">Optional</span>
            </div>
            <div className="glass rounded-2xl p-1.5 dark:shadow-glass-dark">
              <input 
                {...register('limit', { valueAsNumber: true })}
                className="w-full glass border-none rounded-xl px-6 py-4 text-lg font-headline font-bold focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-on-surface-variant/30 dark:shadow-glass-dark" 
                placeholder="0.00" 
                type="number"
              />
            </div>
          </section>

        </main>

        {/* 🚀 Action Bar */}
        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-surface via-surface to-transparent">
          <button 
            type="submit"
            form="transaction-form"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="w-full h-16 bg-primary text-on-primary rounded-3xl font-headline font-black text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all transform hover:scale-102 dark:shadow-glow-primary"
          >
            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Category'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default AddCategory
