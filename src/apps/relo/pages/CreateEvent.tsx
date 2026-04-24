import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useCreateReloAppointment, useReloContacts } from '../features/useReloData'
import type { ReloAppointmentFormValues } from '../types/relo.types'

const CreateEvent: React.FC = () => {
  const navigate = useNavigate()
  const createMutation = useCreateReloAppointment()
  const { data: contacts } = useReloContacts()
  const [form, setForm] = useState<ReloAppointmentFormValues>({ title: '', description: '', location: '', appointment_date: '', appointment_time: '', status: 'upcoming', contact_id: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim() || !form.appointment_date) { setError('Vui lòng điền tiêu đề và ngày hẹn'); return }
    try {
      await createMutation.mutateAsync({ ...form, contact_id: form.contact_id || undefined, appointment_time: form.appointment_time || undefined })
      navigate('/relo/appointments')
    } catch (err: any) { setError(err.message || 'Có lỗi xảy ra') }
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-surface-container dark:bg-surface-container-high flex items-center justify-center active:scale-90 transition-transform !border-0">
          <ArrowLeft size={18} className="text-primary" />
        </button>
        <h1 className="text-xl font-semibold text-on-surface">Thêm sự kiện</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Tiêu đề *</label>
          <input type="text" placeholder="VD: Ăn tối lãng mạn..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Ngày hẹn *</label>
            <input type="date" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
              className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-3 py-3.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Giờ</label>
            <input type="time" value={form.appointment_time} onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
              className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-3 py-3.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Địa điểm</label>
          <input type="text" placeholder="VD: Nhà hàng Hương Việt..." value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
        </div>
        {contacts && contacts.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Với ai</label>
            <select value={form.contact_id} onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
              className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none">
              <option value="">Chọn người thân...</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Ghi chú</label>
          <textarea placeholder="Thêm ghi chú..." rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none" />
        </div>
        {error && <div className="bg-error-container dark:bg-error/15 text-error text-sm px-4 py-3 rounded-[12px]">{error}</div>}
        <button type="submit" disabled={createMutation.isPending}
          className="w-full !bg-primary text-on-primary py-4 rounded-[14px] font-semibold text-base flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-60">
          {createMutation.isPending && <Loader2 size={20} className="animate-spin" />}
          Lưu sự kiện
        </button>
      </form>
    </div>
  )
}

export default CreateEvent
