import React, { useState, useRef } from 'react'
import { Plus, Phone, Mail, Trash2, Loader2, Users, ImagePlus, X, Edit2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useReloContacts, useCreateReloContact, useDeleteReloContact } from '../features/useReloData'
import { uploadContactAvatar, fileToDataUrl } from '../utils/imageUpload'
import { useAuthStore } from '@/store/useAuthStore'
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
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: contacts, isLoading } = useReloContacts()
  const createMutation = useCreateReloContact()
  const deleteMutation = useDeleteReloContact()
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<ReloContactFormValues>({ name: '', relationship_type: 'partner', phone: '', email: '', birthday: '' })
  const [error, setError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setPreviewUrl(null)
      setForm({ ...form, avatar_url: undefined })
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
    if (!form.name.trim()) { setError('Vui lòng nhập tên'); return }
    try {
      await createMutation.mutateAsync(form)
      setForm({ name: '', relationship_type: 'partner', phone: '', email: '', birthday: '' })
      setPreviewUrl(null)
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
          
          {/* Avatar Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Ảnh</label>
            {previewUrl ? (
              <div className="relative w-24 h-24 rounded-[12px] overflow-hidden border-2 border-primary/30">
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={uploadingImage}
                  className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity !bg-transparent !border-0"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full py-8 rounded-[12px] border-2 border-dashed border-primary/30 hover:border-primary/50 bg-primary/5 dark:bg-primary/10 transition-all flex flex-col items-center justify-center gap-2 !bg-surface-container dark:!bg-surface-container-high !border-0"
              >
                {uploadingImage ? (
                  <Loader2 size={20} className="animate-spin text-primary" />
                ) : (
                  <>
                    <ImagePlus size={24} className="text-primary/40" />
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
          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-2">Ngày sinh</label>
            <input type="date" value={form.birthday || ''} onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              className="w-full bg-surface-container dark:bg-surface-container-low rounded-[12px] px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>
          {error && <div className="bg-error-container dark:bg-error/15 text-error text-xs px-4 py-2.5 rounded-[10px]">{error}</div>}
          <div className="flex gap-3">
            <button type="button" onClick={() => { setShowForm(false); setPreviewUrl(null); }} className="flex-1 py-3 rounded-[12px] !bg-surface-container dark:!bg-surface-container-high text-on-surface-variant font-semibold text-sm active:scale-[0.97] transition-all !border-0">Huỷ</button>
            <button onClick={handleSubmit} disabled={createMutation.isPending || uploadingImage} className="flex-1 py-3 rounded-[12px] !bg-primary text-on-primary font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60">
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
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => navigate(`/relo/contacts/${contact.id}/edit`)} className="p-2 rounded-full hover:bg-primary/15 dark:hover:bg-primary/10 transition-colors !bg-transparent !border-0">
                    <Edit2 size={16} className="text-primary opacity-60 hover:opacity-100 transition-opacity" />
                  </button>
                  <button onClick={() => handleDelete(contact.id)} disabled={deletingId === contact.id} className="p-2 rounded-full hover:bg-error-container/30 dark:hover:bg-error/10 transition-colors flex-shrink-0 !bg-transparent !border-0">
                    {deletingId === contact.id ? <Loader2 size={16} className="animate-spin text-error" /> : <Trash2 size={16} className="text-error opacity-40 hover:opacity-100 transition-opacity" />}
                  </button>
                </div>
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
