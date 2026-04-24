import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Trash2, Gift, Utensils, Plane, Gamepad2 } from 'lucide-react'
import {
  useReloPreferences,
  useDeleteReloPreference,
  useReloContacts,
} from '../features/useReloData'
import { supabase } from '@/utils/supabase'
import { useQueryClient } from '@tanstack/react-query'
import type { ReloPreferenceFormValues } from '../types/relo.types'

const categoryOptions = [
  { value: 'food', label: '🍜 Ẩm thực', icon: Utensils },
  { value: 'hobby', label: '🎮 Sở thích', icon: Gamepad2 },
  { value: 'gift', label: '🎁 Quà tặng', icon: Gift },
  { value: 'travel', label: '✈️ Du lịch', icon: Plane },
  { value: 'other', label: '📝 Khác', icon: Gift },
]

const EditPreference: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { data: preferences, isLoading: loadingData } = useReloPreferences()
  const { data: contacts } = useReloContacts()
  const deleteMutation = useDeleteReloPreference()

  const [form, setForm] = useState<ReloPreferenceFormValues>({
    contact_id: '',
    category: 'food',
    item: '',
    notes: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!id || !preferences || initialized) return
    const record = preferences.find((p) => p.id === id)
    if (record) {
      setForm({
        contact_id: record.contact_id,
        category: record.category,
        item: record.item,
        notes: record.notes || '',
      })
      setInitialized(true)
    }
  }, [preferences, id, initialized])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.contact_id) { setError('Vui lòng chọn người thân'); return }
    if (!form.item.trim()) { setError('Vui lòng nhập tên sở thích / món quà'); return }
    setSaving(true)
    try {
      const { error: err } = await supabase
        .from('relo_preferences')
        .update({ ...form })
        .eq('id', id!)
      if (err) throw new Error(err.message)
      queryClient.invalidateQueries({ queryKey: ['relo_preferences'] })
      navigate('/relo/preferences')
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Xóa sở thích này? Hành động không thể hoàn tác.')) return
    try {
      await deleteMutation.mutateAsync(id!)
      navigate('/relo/preferences')
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
          <h1 className="text-xl font-semibold text-on-surface">Chỉnh sửa sở thích</h1>
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
        {/* Contact */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Người thân *</label>
          <select
            value={form.contact_id}
            onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none"
          >
            <option value="">Chọn người thân...</option>
            {contacts?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Danh mục</label>
          <div className="grid grid-cols-3 gap-2">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, category: opt.value as ReloPreferenceFormValues['category'] })}
                className={`py-2.5 px-2 rounded-[10px] text-xs font-semibold transition-all text-center !border-0 ${form.category === opt.value ? '!bg-primary text-on-primary shadow-sm' : '!bg-surface-container dark:!bg-surface-container-high text-on-surface-variant'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Item */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Tên sở thích / món quà *</label>
          <input
            type="text"
            placeholder="VD: Bánh kem dâu tây..."
            value={form.item}
            onChange={(e) => setForm({ ...form, item: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Ghi chú thêm</label>
          <textarea
            placeholder="VD: Màu xanh navy, size M..."
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
          />
        </div>

        {error && <div className="bg-error-container dark:bg-error/15 text-error text-sm px-4 py-3 rounded-[12px]">{error}</div>}

        <button
          type="submit"
          disabled={saving}
          className="w-full !bg-primary text-on-primary py-4 rounded-[14px] font-semibold text-base flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {saving && <Loader2 size={20} className="animate-spin" />}
          Lưu thay đổi
        </button>
      </form>
    </div>
  )
}

export default EditPreference
