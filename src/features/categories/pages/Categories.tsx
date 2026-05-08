import React from 'react'
import { PlusCircle, Info, ChevronLeft, Inbox } from 'lucide-react'
import { LoadingSpinner } from '@/components/Loading'
import { useNavigate, Link } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'
import { TRANSACTION_TYPES_METADATA, type TransactionType } from '@/types/transaction.types'

const Categories: React.FC = () => {
  const navigate = useNavigate()
  const { data: categories, isLoading } = useCategories()

  // 🎨 Category Card Component
  const CategoryCard = ({ icon, name, type, color }: any) => (
    <div className="group relative glass rounded-3xl p-6 flex flex-col gap-4 hover:shadow-glow-primary cursor-pointer smooth-transition transform hover:scale-105 active:scale-95 dark:shadow-glass-dark">
      <div className={`w-14 h-14 glass rounded-2xl flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 dark:shadow-glass-dark ${color}`}>
        <span className="material-symbols-outlined text-3xl text-primary opacity-80 group-hover:opacity-100" style={{ fontVariationSettings: "'FILL' 0" }}>{icon}</span>
      </div>
      <div>
        <span className="block font-headline font-bold text-lg text-on-surface truncate pr-2 group-hover:text-primary transition-colors">{name}</span>
        <span className={`inline-block px-3 py-1.5 mt-2 rounded-full text-xs font-bold uppercase tracking-wider glass transition-all group-hover:shadow-glow-primary dark:shadow-glass-dark ${
          TRANSACTION_TYPES_METADATA[type as TransactionType]?.badge || 'bg-error/10 text-error'
        }`}>
          {TRANSACTION_TYPES_METADATA[type as TransactionType]?.label || type}
        </span>
      </div>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto md:max-w-none pt-4 pb-24 no-scrollbar">
      
      {/* 🏔️ Header */}
      <section className="mb-8 mt-2 flex items-center gap-4 px-2">
         <button 
           onClick={() => navigate(-1)}
           className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-95"
         >
           <ChevronLeft className="w-6 h-6 text-on-surface" />
         </button>
         <div>
            <p className="font-label text-label-sm uppercase tracking-[0.15em] text-on-surface-variant font-bold opacity-60">Configuration</p>
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Categories</h2>
         </div>
      </section>

      {/* 🎨 Bento Grid of Categories */}
      <main className="px-2">
        <p className="text-on-surface-variant text-body-md mb-8 max-w-[85%] leading-relaxed font-medium">
          Organize your financial flow by managing your spending and income categories.
        </p>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" message="Đang tải danh mục..." />
          </div>
        ) : categories?.length === 0 ? (
          <section className="glass rounded-[2.5rem] p-12 text-center space-y-4 glass-border dark:shadow-glass-dark">
             <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto transform hover:scale-110 transition-all group-hover:shadow-glow-primary dark:shadow-glass-dark">
               <Inbox className="w-8 h-8 text-primary opacity-70" />
             </div>
             <div className="space-y-1">
               <h3 className="font-headline font-bold text-xl text-on-surface">No Categories Found</h3>
               <p className="text-sm text-on-surface-variant font-medium">Start by adding your first spending or income category below.</p>
             </div>
          </section>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {categories?.map((cat) => (
              <div key={cat.id} onClick={() => navigate(`/settings/categories/edit/${cat.id}`)}>
                <CategoryCard 
                  icon={cat.icon} 
                  name={cat.name} 
                  type={cat.type} 
                  color={cat.color} 
                />
              </div>
            ))}
          </div>
        )}

        {/* 🚀 Actions */}
        <div className="mt-8">
           <Link 
            to="/settings/categories/add"
            className="w-full h-16 glass text-primary rounded-3xl font-headline font-black text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all dark:shadow-glow-primary transform hover:scale-102 smooth-transition dark:shadow-glass-dark"
          >
            <PlusCircle className="w-6 h-6" />
            Add Category
          </Link>
        </div>

        {/* 💡 Hint Section */}
        <section className="mt-12 glass p-6 rounded-3xl flex items-start gap-4 dark:shadow-glass-dark">
          <Info className="w-6 h-6 text-primary mt-0.5 flex-shrink-0 glow" />
          <p className="text-on-surface-variant text-sm leading-relaxed font-semibold italic opacity-85">
            Long press on any category card to access the edit and delete options. You can also reorder them by dragging.
          </p>
        </section>

      </main>

    </div>
  )
}

export default Categories
