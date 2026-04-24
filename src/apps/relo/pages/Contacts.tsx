import React, { useState } from 'react'
import { Plus, Phone, Mail, Trash2, Loader2, Users } from 'lucide-react'
import { useReloContacts, useCreateReloContact, useDeleteReloContact } from '../features/useReloData'
import type { ReloContactFormValues } from '../types/relo.types'

const relationshipConfig = {
  partner: { label: 'Người yêu', emoji: '💑', cls: 'bg-error-container text-error dark:bg-error/15 dark:text-error' },
  family: { label: 'Gia đình', emoji: '👨‍👩‍👧', cls: 'bg-primary-container text-primary dark:bg-primary/15' },
  friend: { label: 'Bạn bè', emoji: '🤝', cls: 'bg-tertiary-container text-tertiary dark:bg-tertiary/15' },
  other: { label: 'Khác', emoji: '👤', cls: 'bg-surface-container-high text-on-surface-variant' },
}

const getAvatarUrl = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2dfff&color=3525cd&bold=true&size=128`

const Contacts: React.FC = () => {
  const { data: contacts, isLoading } = useReloContacts()
  const createMutation = useCreateReloContact()
  const deleteMutation = useDeleteReloContact()
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<ReloContactFormValues>({ name: '', relationship_type: 'partner', phone: '', email: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Vui lòng nhập tên'); return }
    try {
      await createMutation.mutateAsync(form)
      setForm({ name: '', relationship_type: 'partner', phone: '', email: '' })
      setShowForm(false)
    } catch (err: any) { setError(err.message || 'Có lỗi xảy ra') }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa người thân này?')) return
    setDeletingId(id)
    try { await deleteMutation.mutateAsync(id) }
    finally { setDeletingId(null) }
  }

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Người thân</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{contacts?.length || 0} người</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="w-11 h-11 !bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md shadow-primary/30 active:scale-90 transition-transform">
          <Plus size={22} />
        </button>
      </div>

      {showForm && (
        <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[20px] border border-outline-variant/20 dark:border-outline-variant/10 shadow-sm dark:shadow-dark p-5 space-y-4">
          <h2 className="font-semibold text-on-surface text-base">Thêm người thân</h2>
          <input type="text" placeholder="Tên *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(relationshipConfig) as [ReloContactFormValues['relationship_type'], typeof relationshipConfig[keyof typeof relationshipConfig]][]).map(([key, cfg]) => (
              <button key={key} type="button" onClick={() => setForm({ ...form, relationship_type: key })}
                className={`py-2.5 px-3 rounded-[10px] text-xs font-semibold transition-all text-left flex items-center gap-2 !border-0 ${form.relationship_type === key ? '!bg-primary text-on-primary' : '!bg-surface-container dark:!bg-surface-container-high text-on-surface-variant'}`}>
                <span>{cfg.emoji}</span><span className="truncate">{cfg.label}</span>
              </button>
            ))}
          </div>
          <input type="tel" placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          {error && <div className="bg-error-container dark:bg-error/15 text-error text-xs px-4 py-2.5 rounded-[10px]">{error}</div>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-[12px] !bg-surface-container dark:!bg-surface-container-high text-on-surface-variant font-semibold text-sm active:scale-[0.97] transition-all !border-0">Huỷ</button>
            <button onClick={handleSubmit} disabled={createMutation.isPending} className="flex-1 py-3 rounded-[12px] !bg-primary text-on-primary font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60">
              {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}Lưu
            </button>
          </div>
        </div>
      )}

      {isLoading && <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-primary/40" /></div>}

      {!isLoading && !contacts?.length && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-primary-container/50 dark:bg-primary/15 flex items-center justify-center mb-4">
            <Users size={32} className="text-primary/40" />
          </div>
          <h3 className="font-semibold text-on-surface">Chưa có người thân nào</h3>
          <p className="text-sm text-on-surface-variant mt-1 max-w-xs">Thêm những người quan trọng với bạn</p>
          <button onClick={() => setShowForm(true)} className="mt-5 !bg-primary text-on-primary px-6 py-3 rounded-full text-sm font-medium shadow-md shadow-primary/20 active:scale-[0.97] transition-all">Thêm người đầu tiên</button>
        </div>
      )}

      {!isLoading && contacts && contacts.length > 0 && (
        <div className="space-y-3">
          {contacts.map((contact) => {
            const cfg = relationshipConfig[contact.relationship_type] || relationshipConfig.other
            return (
              <div key={contact.id} className="bg-surface-container-lowest dark:bg-surface-container rounded-[16px] border border-outline-variant/20 dark:border-outline-variant/10 shadow-sm dark:shadow-dark p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <img src={contact.avatar_url || getAvatarUrl(contact.name)} alt={contact.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-on-surface text-sm truncate">{contact.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${cfg.cls}`}>{cfg.emoji} {cfg.label}</span>
                  </div>
                  {contact.phone && <div className="flex items-center gap-1 mt-0.5"><Phone size={10} className="text-outline" /><p className="text-xs text-outline">{contact.phone}</p></div>}
                  {contact.email && <div className="flex items-center gap-1 mt-0.5"><Mail size={10} className="text-outline" /><p className="text-xs text-outline truncate">{contact.email}</p></div>}
                </div>
                <button onClick={() => handleDelete(contact.id)} disabled={deletingId === contact.id} className="p-2 rounded-full hover:bg-error-container/30 dark:hover:bg-error/10 transition-colors flex-shrink-0 !bg-transparent !border-0">
                  {deletingId === contact.id ? <Loader2 size={16} className="animate-spin text-error" /> : <Trash2 size={16} className="text-error opacity-40 hover:opacity-100 transition-opacity" />}
                </button>
              </div>
            )
          })}
        </div>
      )}
      <div className="h-4" />
    </div>
  )
}

export default Contacts
