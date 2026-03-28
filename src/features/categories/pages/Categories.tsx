import React from 'react'
import { PlusCircle, Info, ChevronLeft, Loader2, Inbox } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'

const Categories: React.FC = () => {
  const navigate = useNavigate()
  const { data: categories, isLoading } = useCategories()

  // 🎨 Category Card Component
  const CategoryCard = ({ icon, name, type, color }: any) => (
    <div className="group relative bg-surface-container-lowest p-5 rounded-2xl flex flex-col gap-4 hover:bg-surface-bright transition-all duration-300 active:scale-95 cursor-pointer border border-outline-variant/10 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>{icon}</span>
      </div>
      <div>
        <span className="block font-headline font-bold text-lg text-on-surface truncate pr-2">{name}</span>
        <span className={`inline-block px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          type === 'income' ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'
        }`}>
          {type}
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
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="font-headline font-bold">Synchronizing workspace...</p>
          </div>
        ) : categories?.length === 0 ? (
          <section className="bg-surface-container-low border-2 border-dashed border-outline-variant/40 rounded-[2.5rem] p-12 text-center space-y-4">
             <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto">
               <Inbox className="w-8 h-8 text-outline-variant" />
             </div>
             <div className="space-y-1">
               <h3 className="font-headline font-bold text-xl text-on-surface">No Categories Found</h3>
               <p className="text-sm text-outline font-medium">Start by adding your first spending or income category below.</p>
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
            className="w-full h-16 bg-primary text-on-primary rounded-3xl font-headline font-black text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-2xl shadow-primary/30 border border-primary/20"
          >
            <PlusCircle className="w-6 h-6" />
            Add Category
          </Link>
        </div>

        {/* 💡 Hint Section */}
        <section className="mt-12 p-6 bg-surface-container rounded-3xl flex items-start gap-4 border border-outline-variant/10">
          <Info className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-on-surface-variant text-sm leading-relaxed font-semibold italic opacity-85">
            Long press on any category card to access the edit and delete options. You can also reorder them by dragging.
          </p>
        </section>

      </main>

    </div>
  )
}

export default Categories
