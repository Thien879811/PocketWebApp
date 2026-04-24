import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useCreateReloPreference, useReloContacts } from '../features/useReloData'
import type { ReloPreferenceFormValues } from '../types/relo.types'

const categoryOptions = [
  { value: 'food', label: '🍜 Ẩm thực' },
  { value: 'hobby', label: '🎮 Sở thích' },
  { value: 'gift', label: '🎁 Quà tặng' },
  { value: 'travel', label: '✈️ Du lịch' },
  { value: 'other', label: '📝 Khác' },
]

const CreatePreference: React.FC = () => {
  const navigate = useNavigate()
  const createMutation = useCreateReloPreference()
  const { data: contacts } = useReloContacts()
  const [form, setForm] = useState<ReloPreferenceFormValues>({ contact_id: '', category: 'food', item: '', notes: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.contact_id) { setError('Vui lòng chọn người thân'); return }
    if (!form.item.trim()) { setError('Vui lòng nhập tên sở thích / món quà'); return }
    try {
      await createMutation.mutateAsync(form)
      navigate('/relo/preferences')
    } catch (err: any) { setError(err.message || 'Có lỗi xảy ra') }
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-surface-container dark:bg-surface-container-high flex items-center justify-center active:scale-90 transition-transform !border-0">
          <ArrowLeft size={18} className="text-primary" />
        </button>
        <h1 className="text-xl font-semibold text-on-surface">Thêm sở thích</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Người thân *</label>
          {!contacts || contacts.length === 0 ? (
            <div className="bg-error-container/50 dark:bg-error/15 text-error text-sm px-4 py-3 rounded-[12px]">Bạn chưa có người thân nào. Hãy thêm trước!</div>
          ) : (
            <select value={form.contact_id} onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
              className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none">
              <option value="">Chọn người thân...</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Danh mục</label>
          <div className="grid grid-cols-3 gap-2">
            {categoryOptions.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setForm({ ...form, category: opt.value as ReloPreferenceFormValues['category'] })}
                className={`py-2.5 px-2 rounded-[10px] text-xs font-semibold transition-all text-center !border-0 ${form.category === opt.value ? '!bg-primary text-on-primary shadow-sm' : '!bg-surface-container dark:!bg-surface-container-high text-on-surface-variant'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Tên sở thích / món quà *</label>
          <input type="text" placeholder="VD: Bánh kem dâu tây..." value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Ghi chú thêm</label>
          <textarea placeholder="VD: Màu xanh navy, size M..." rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none" />
        </div>
        {error && <div className="bg-error-container dark:bg-error/15 text-error text-sm px-4 py-3 rounded-[12px]">{error}</div>}
        <button type="submit" disabled={createMutation.isPending}
          className="w-full !bg-primary text-on-primary py-4 rounded-[14px] font-semibold text-base flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-60">
          {createMutation.isPending && <Loader2 size={20} className="animate-spin" />}
          Lưu sở thích
        </button>
      </form>
    </div>
  )
}

export default CreatePreference
