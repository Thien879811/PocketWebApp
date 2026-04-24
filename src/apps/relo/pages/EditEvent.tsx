import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Trash2, MapPin } from 'lucide-react'
import {
  useReloAppointments,
  useUpdateReloAppointment,
  useDeleteReloAppointment,
  useReloContacts,
} from '../features/useReloData'
import type { ReloAppointmentFormValues } from '../types/relo.types'

const statusOptions = [
  { value: 'upcoming', label: '🔵 Sắp tới' },
  { value: 'completed', label: '✅ Đã xong' },
  { value: 'cancelled', label: '❌ Đã huỷ' },
]

const EditEvent: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: appointments, isLoading: loadingData } = useReloAppointments()
  const { data: contacts } = useReloContacts()
  const updateMutation = useUpdateReloAppointment()
  const deleteMutation = useDeleteReloAppointment()

  const [form, setForm] = useState<ReloAppointmentFormValues>({
    title: '',
    description: '',
    location: '',
    appointment_date: '',
    appointment_time: '',
    status: 'upcoming',
    contact_id: '',
  })
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!id || !appointments || initialized) return
    const record = appointments.find((a) => a.id === id)
    if (record) {
      setForm({
        title: record.title,
        description: record.description || '',
        location: record.location || '',
        appointment_date: record.appointment_date,
        appointment_time: record.appointment_time || '',
        status: record.status,
        contact_id: record.contact_id || '',
      })
      setInitialized(true)
    }
  }, [appointments, id, initialized])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim() || !form.appointment_date) {
      setError('Vui lòng điền tiêu đề và ngày hẹn')
      return
    }
    try {
      await updateMutation.mutateAsync({
        id: id!,
        ...form,
        contact_id: form.contact_id || undefined,
        appointment_time: form.appointment_time || undefined,
      })
      navigate('/relo/appointments')
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Xóa lịch hẹn này? Hành động không thể hoàn tác.')) return
    try {
      await deleteMutation.mutateAsync(id!)
      navigate('/relo/appointments')
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra')
    }
  }

  if (loadingData || !initialized) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary/40" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-surface-container dark:bg-surface-container-high flex items-center justify-center active:scale-90 transition-transform !border-0"
          >
            <ArrowLeft size={18} className="text-primary" />
          </button>
          <h1 className="text-xl font-semibold text-on-surface">Chỉnh sửa sự kiện</h1>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs text-error font-medium !bg-error-container/40 dark:!bg-error/15 !border-0 hover:!bg-error-container dark:hover:!bg-error/20 transition-colors"
        >
          {deleteMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          Xóa
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Tiêu đề *</label>
          <input
            type="text"
            placeholder="VD: Ăn tối lãng mạn..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Ngày hẹn *</label>
            <input
              type="date"
              value={form.appointment_date}
              onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
              className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-3 py-3.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Giờ</label>
            <input
              type="time"
              value={form.appointment_time}
              onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
              className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-3 py-3.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Trạng thái</label>
          <div className="flex gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, status: opt.value as ReloAppointmentFormValues['status'] })}
                className={`flex-1 py-2.5 px-2 rounded-[10px] text-xs font-semibold transition-all !border-0 text-center ${form.status === opt.value ? '!bg-primary text-on-primary shadow-sm' : '!bg-surface-container dark:!bg-surface-container-high text-on-surface-variant'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Địa điểm</label>
          <div className="relative">
            <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
            <input
              type="text"
              placeholder="VD: Nhà hàng Hương Việt..."
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] pl-10 pr-4 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>

        {/* Contact */}
        {contacts && contacts.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Với ai</label>
            <select
              value={form.contact_id}
              onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
              className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none"
            >
              <option value="">Chọn người thân...</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Ghi chú</label>
          <textarea
            placeholder="Thêm ghi chú..."
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
          />
        </div>

        {error && <div className="bg-error-container dark:bg-error/15 text-error text-sm px-4 py-3 rounded-[12px]">{error}</div>}

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full !bg-primary text-on-primary py-4 rounded-[14px] font-semibold text-base flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {updateMutation.isPending && <Loader2 size={20} className="animate-spin" />}
          Lưu thay đổi
        </button>
      </form>
    </div>
  )
}

export default EditEvent
