import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Gift, Utensils, Plane, Gamepad2, Trash2, Loader2 } from 'lucide-react'
import { useReloPreferences, useDeleteReloPreference, useReloContacts } from '../features/useReloData'

const categoryConfig = {
  food: { label: 'Ẩm thực', icon: Utensils, cls: 'bg-error-container text-error dark:bg-error/15' },
  hobby: { label: 'Sở thích', icon: Gamepad2, cls: 'bg-primary-container text-primary dark:bg-primary/15' },
  gift: { label: 'Quà tặng', icon: Gift, cls: 'bg-tertiary-container text-tertiary dark:bg-tertiary/15' },
  travel: { label: 'Du lịch', icon: Plane, cls: 'bg-secondary-container text-secondary dark:bg-secondary/15' },
  other: { label: 'Khác', icon: Gift, cls: 'bg-surface-container-high text-on-surface-variant' },
}

const Preferences: React.FC = () => {
  const navigate = useNavigate()
  const { data: preferences, isLoading } = useReloPreferences()
  const { data: contacts } = useReloContacts()
  const deleteMutation = useDeleteReloPreference()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<string>('all')

  const filtered = selectedContact === 'all' ? preferences ?? [] : preferences?.filter((p) => p.contact_id === selectedContact) ?? []

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, pref) => {
    const cat = pref.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(pref)
    return acc
  }, {})

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa sở thích này?')) return
    setDeletingId(id)
    try { await deleteMutation.mutateAsync(id) }
    finally { setDeletingId(null) }
  }

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Sở thích & Quà tặng</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{preferences?.length || 0} mục</p>
        </div>
        <button onClick={() => navigate('/relo/preferences/create')} className="w-11 h-11 !bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md shadow-primary/30 active:scale-90 transition-transform">
          <Plus size={22} />
        </button>
      </div>

      {contacts && contacts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setSelectedContact('all')} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all !border-0 ${selectedContact === 'all' ? '!bg-primary text-on-primary shadow-sm' : '!bg-surface-container dark:!bg-surface-container-high text-on-surface-variant'}`}>
            Tất cả
          </button>
          {contacts.map((c) => (
            <button key={c.id} onClick={() => setSelectedContact(c.id)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all !border-0 ${selectedContact === c.id ? '!bg-primary text-on-primary shadow-sm' : '!bg-surface-container dark:!bg-surface-container-high text-on-surface-variant'}`}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {isLoading && <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-primary/40" /></div>}

      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-tertiary-container/50 dark:bg-tertiary/15 flex items-center justify-center mb-3">
            <Gift size={28} className="text-tertiary/40" />
          </div>
          <p className="text-sm font-medium text-on-surface">Chưa có sở thích nào</p>
          <p className="text-xs text-on-surface-variant mt-1">Lưu lại để không bao giờ quên khi mua quà</p>
          <button onClick={() => navigate('/relo/preferences/create')} className="mt-5 !bg-primary text-on-primary px-6 py-2.5 rounded-full text-sm font-medium shadow-md shadow-primary/20 active:scale-[0.97] transition-all">
            Thêm sở thích
          </button>
        </div>
      )}

      {!isLoading && Object.entries(grouped).map(([cat, items]) => {
        const cfg = categoryConfig[cat as keyof typeof categoryConfig] || categoryConfig.other
        const Icon = cfg.icon
        return (
          <section key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.cls}`}><Icon size={14} /></div>
              <h2 className="text-sm font-semibold text-on-surface">{cfg.label}</h2>
              <span className="text-xs text-outline ml-auto">{items.length} mục</span>
            </div>
            <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[16px] border border-outline-variant/20 dark:border-outline-variant/10 shadow-sm dark:shadow-dark divide-y divide-outline-variant/10">
              {items.map((pref) => (
                <div key={pref.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{pref.item}</p>
                    {pref.relo_contacts?.name && <p className="text-xs text-on-surface-variant mt-0.5">— {pref.relo_contacts.name}</p>}
                    {pref.notes && <p className="text-xs text-outline mt-0.5 truncate">{pref.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => navigate(`/relo/preferences/edit/${pref.id}`)} className="p-2 rounded-full hover:bg-primary-container/30 dark:hover:bg-primary/10 transition-colors !bg-transparent !border-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary opacity-60 hover:opacity-100 transition-opacity"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(pref.id)} disabled={deletingId === pref.id} className="p-2 rounded-full hover:bg-error-container/30 dark:hover:bg-error/10 transition-colors !bg-transparent !border-0">
                      {deletingId === pref.id ? <Loader2 size={14} className="animate-spin text-error" /> : <Trash2 size={14} className="text-error opacity-50 hover:opacity-100 transition-opacity" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}
      <div className="h-4" />
    </div>
  )
}

export default Preferences
