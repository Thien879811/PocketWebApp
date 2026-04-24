import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useCreateReloAnniversary, useReloContacts } from '../features/useReloData'
import type { ReloAnniversaryFormValues } from '../types/relo.types'

const CreateAnniversary: React.FC = () => {
  const navigate = useNavigate()
  const createMutation = useCreateReloAnniversary()
  const { data: contacts } = useReloContacts()
  const [form, setForm] = useState<ReloAnniversaryFormValues>({ title: '', description: '', anniversary_date: '', is_recurring: true, reminder_days: 7, contact_id: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim() || !form.anniversary_date) { setError('Vui lòng điền tiêu đề và ngày kỷ niệm'); return }
    try {
      await createMutation.mutateAsync({ ...form, contact_id: form.contact_id || undefined })
      navigate('/relo/anniversaries')
    } catch (err: any) { setError(err.message || 'Có lỗi xảy ra') }
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-surface-container dark:bg-surface-container-high flex items-center justify-center active:scale-90 transition-transform !border-0">
          <ArrowLeft size={18} className="text-primary" />
        </button>
        <h1 className="text-xl font-semibold text-on-surface">Thêm kỷ niệm</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Tiêu đề *</label>
          <input type="text" placeholder="VD: Kỷ niệm 2 năm yêu nhau..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Ngày kỷ niệm *</label>
          <input type="date" value={form.anniversary_date} onChange={(e) => setForm({ ...form, anniversary_date: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
        </div>
        {contacts && contacts.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Gắn với người thân</label>
            <select value={form.contact_id} onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
              className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none">
              <option value="">Không gắn</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Ghi chú</label>
          <textarea placeholder="Ghi chú thêm..." rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none" />
        </div>
        {/* Recurring toggle */}
        <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[16px] border border-outline-variant/20 dark:border-outline-variant/10 p-4 flex items-center justify-between">
          <div><p className="text-sm font-medium text-on-surface">Nhắc hằng năm</p><p className="text-xs text-on-surface-variant mt-0.5">Tự động nhắc lại mỗi năm</p></div>
          <button type="button" onClick={() => setForm({ ...form, is_recurring: !form.is_recurring })}
            className={`w-12 h-6 rounded-full transition-all relative !border-0 ${form.is_recurring ? '!bg-primary' : '!bg-outline-variant'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${form.is_recurring ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
        {/* Reminder days */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Nhắc trước (ngày)</label>
          <div className="flex gap-2">
            {[1, 3, 7, 14, 30].map((d) => (
              <button key={d} type="button" onClick={() => setForm({ ...form, reminder_days: d })}
                className={`flex-1 py-2.5 rounded-[10px] text-xs font-semibold transition-all !border-0 ${form.reminder_days === d ? '!bg-primary text-on-primary shadow-sm' : '!bg-surface-container dark:!bg-surface-container-high text-on-surface-variant'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        {error && <div className="bg-error-container dark:bg-error/15 text-error text-sm px-4 py-3 rounded-[12px]">{error}</div>}
        <button type="submit" disabled={createMutation.isPending}
          className="w-full !bg-primary text-on-primary py-4 rounded-[14px] font-semibold text-base flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-60">
          {createMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : null}
          Lưu kỷ niệm
        </button>
      </form>
    </div>
  )
}

export default CreateAnniversary
