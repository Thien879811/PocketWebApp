import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Trash2, ImagePlus, X } from 'lucide-react'
import { useReloContacts, useUpdateReloContact, useDeleteReloContact } from '../features/useReloData'
import { uploadContactAvatar, fileToDataUrl, deleteContactAvatar } from '../utils/imageUpload'
import { useAuthStore } from '@/store/useAuthStore'
import type { ReloContactFormValues } from '../types/relo.types'

const relationshipConfig = {
  partner: { label: 'Người yêu', emoji: '💑', cls: 'bg-error-container text-error dark:bg-error/15 dark:text-error' },
  family: { label: 'Gia đình', emoji: '👨‍👩‍👧', cls: 'bg-primary-container text-primary dark:bg-primary/15' },
  friend: { label: 'Bạn bè', emoji: '🤝', cls: 'bg-tertiary-container text-tertiary dark:bg-tertiary/15' },
  other: { label: 'Khác', emoji: '👤', cls: 'bg-surface-container-high text-on-surface-variant' },
}

const EditContact: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const { data: contacts, isLoading: loadingData } = useReloContacts()
  const updateMutation = useUpdateReloContact()
  const deleteMutation = useDeleteReloContact()

  const [form, setForm] = useState<ReloContactFormValues>({
    name: '',
    relationship_type: 'partner',
    phone: '',
    email: '',
    birthday: '',
    avatar_url: undefined,
  })
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id || !contacts || initialized) return
    const record = contacts.find((c) => c.id === id)
    if (record) {
      setForm({
        name: record.name,
        relationship_type: record.relationship_type,
        phone: record.phone || '',
        email: record.email || '',
        birthday: record.birthday || '',
        avatar_url: record.avatar_url,
      })
      setOriginalAvatarUrl(record.avatar_url || null)
      setPreviewUrl(record.avatar_url || null)
      setInitialized(true)
    }
  }, [contacts, id, initialized])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setError('')
      setUploadingImage(true)

      // Show preview
      const dataUrl = await fileToDataUrl(file)
      setPreviewUrl(dataUrl)

      // Upload image
      if (!user?.id) throw new Error('Chưa đăng nhập')
      const avatarUrl = await uploadContactAvatar(file, user.id)
      setForm({ ...form, avatar_url: avatarUrl })
    } catch (err: any) {
      setError(err.message || 'Lỗi tải ảnh lên')
      setPreviewUrl(originalAvatarUrl)
      setForm({ ...form, avatar_url: originalAvatarUrl || undefined })
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    setForm({ ...form, avatar_url: undefined })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) {
      setError('Vui lòng nhập tên')
      return
    }
    try {
      await updateMutation.mutateAsync({
        id: id!,
        ...form,
      })
      navigate('/relo/contacts')
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Xóa người thân này? Hành động không thể hoàn tác.')) return
    try {
      // Delete old avatar if exists
      if (originalAvatarUrl) {
        await deleteContactAvatar(originalAvatarUrl)
      }
      await deleteMutation.mutateAsync(id!)
      navigate('/relo/contacts')
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
          <h1 className="text-xl font-semibold text-on-surface">Chỉnh sửa người thân</h1>
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
        {/* Avatar Upload */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Ảnh</label>
          {previewUrl ? (
            <div className="relative w-32 h-32 rounded-[12px] overflow-hidden border-2 border-primary/30">
              <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={uploadingImage}
                className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity !bg-transparent !border-0"
              >
                <X size={28} className="text-white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="w-full py-12 rounded-[12px] border-2 border-dashed border-primary/30 hover:border-primary/50 bg-primary/5 dark:bg-primary/10 transition-all flex flex-col items-center justify-center gap-3 !bg-surface-container dark:!bg-surface-container-high !border-0"
            >
              {uploadingImage ? (
                <Loader2 size={24} className="animate-spin text-primary" />
              ) : (
                <>
                  <ImagePlus size={32} className="text-primary/40" />
                  <span className="text-xs text-on-surface-variant font-medium">Chọn ảnh</span>
                </>
              )}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            disabled={uploadingImage}
            className="hidden"
          />
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Tên *</label>
          <input
            type="text"
            placeholder="Tên"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Relationship Type */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Mối quan hệ</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(relationshipConfig) as [ReloContactFormValues['relationship_type'], typeof relationshipConfig[keyof typeof relationshipConfig]][]).map(
              ([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, relationship_type: key })}
                  className={`py-2.5 px-3 rounded-[10px] text-xs font-semibold transition-all text-left flex items-center gap-2 !border-0 ${
                    form.relationship_type === key
                      ? '!bg-primary text-on-primary'
                      : '!bg-surface-container dark:!bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <span>{cfg.emoji}</span>
                  <span className="truncate">{cfg.label}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Số điện thoại</label>
          <input
            type="tel"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Birthday */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Ngày sinh</label>
          <input
            type="date"
            value={form.birthday || ''}
            onChange={(e) => setForm({ ...form, birthday: e.target.value })}
            className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Error */}
        {error && <div className="bg-error-container dark:bg-error/15 text-error text-sm px-4 py-3 rounded-[12px]">{error}</div>}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/relo/contacts')}
            className="flex-1 py-3.5 rounded-[12px] !bg-surface-container dark:!bg-surface-container-high text-on-surface-variant font-semibold text-sm active:scale-[0.97] transition-all !border-0"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending || uploadingImage}
            className="flex-1 py-3.5 rounded-[12px] !bg-primary text-on-primary font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60"
          >
            {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
            Cập nhật
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditContact
