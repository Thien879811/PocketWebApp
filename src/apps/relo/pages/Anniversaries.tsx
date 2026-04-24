import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Heart, Trash2, ChevronRight, Loader2 } from 'lucide-react'
import { useReloAnniversaries, useDeleteReloAnniversary, daysUntilAnniversary } from '../features/useReloData'

const Anniversaries: React.FC = () => {
  const navigate = useNavigate()
  const { data: anniversaries, isLoading } = useReloAnniversaries()
  const deleteMutation = useDeleteReloAnniversary()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa kỷ niệm này?')) return
    setDeletingId(id)
    try { await deleteMutation.mutateAsync(id) }
    finally { setDeletingId(null) }
  }

  const grouped: Record<string, typeof anniversaries> = {
    'Hôm nay': anniversaries?.filter((a) => daysUntilAnniversary(a.anniversary_date) === 0) ?? [],
    'Tuần này': anniversaries?.filter((a) => { const d = daysUntilAnniversary(a.anniversary_date); return d > 0 && d <= 7 }) ?? [],
    'Tháng này': anniversaries?.filter((a) => { const d = daysUntilAnniversary(a.anniversary_date); return d > 7 && d <= 30 }) ?? [],
    'Sắp đến': anniversaries?.filter((a) => daysUntilAnniversary(a.anniversary_date) > 30) ?? [],
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Kỷ niệm</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{anniversaries?.length || 0} ngày đặc biệt</p>
        </div>
        <button
          onClick={() => navigate('/relo/anniversaries/create')}
          className="w-11 h-11 !bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md shadow-primary/30 active:scale-90 transition-transform"
        >
          <Plus size={22} />
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-primary/40" />
        </div>
      )}

      {!isLoading && !anniversaries?.length && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-error-container/40 dark:bg-error/15 flex items-center justify-center mb-4">
            <Heart size={36} className="text-error/50" />
          </div>
          <h3 className="font-semibold text-on-surface">Chưa có kỷ niệm nào</h3>
          <p className="text-sm text-on-surface-variant mt-1 max-w-xs">Lưu giữ những ngày đặc biệt để không bao giờ quên</p>
          <button
            onClick={() => navigate('/relo/anniversaries/create')}
            className="mt-6 !bg-primary text-on-primary px-6 py-3 rounded-full text-sm font-medium shadow-md shadow-primary/20 active:scale-[0.97] transition-all"
          >
            Thêm kỷ niệm đầu tiên
          </button>
        </div>
      )}

      {!isLoading && Object.entries(grouped).map(([group, items]) => {
        if (!items?.length) return null
        return (
          <section key={group}>
            <h2 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-3 px-1">{group}</h2>
            <div className="space-y-3">
              {items.map((anni) => {
                const daysLeft = daysUntilAnniversary(anni.anniversary_date)
                const isToday = daysLeft === 0
                return (
                  <div key={anni.id} className={`bg-surface-container-lowest dark:bg-surface-container rounded-[16px] border shadow-sm dark:shadow-dark overflow-hidden ${isToday ? 'border-error/30 dark:border-error/20' : 'border-outline-variant/20 dark:border-outline-variant/10'}`}>
                    <div className="p-4 flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isToday ? 'bg-error-container dark:bg-error/15' : 'bg-primary-container/50 dark:bg-primary/15'}`}>
                        <Heart size={22} className={isToday ? 'text-error fill-error/30' : 'text-primary fill-primary/20'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-on-surface text-sm truncate">{anni.title}</p>
                        {anni.relo_contacts?.name && <p className="text-xs text-on-surface-variant">với {anni.relo_contacts.name}</p>}
                        <p className="text-xs text-outline mt-0.5">
                          {new Date(anni.anniversary_date).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long' })}
                          {anni.is_recurring && ' · Hằng năm'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isToday ? 'bg-error text-on-error' : daysLeft <= 7 ? 'bg-error-container text-error dark:bg-error/20' : 'bg-primary-container text-primary dark:bg-primary/20'}`}>
                          {isToday ? 'Hôm nay!' : `${daysLeft}n`}
                        </span>
                        <button onClick={() => navigate(`/relo/anniversaries/edit/${anni.id}`)} className="p-2 rounded-full hover:bg-surface-container-high dark:hover:bg-surface-container-high transition-colors !border-0 !bg-transparent">
                          <ChevronRight size={16} className="text-outline-variant" />
                        </button>
                      </div>
                    </div>
                    <div className="border-t border-outline-variant/15 dark:border-outline-variant/10 px-4 py-2 flex items-center justify-between">
                      <button onClick={() => handleDelete(anni.id)} disabled={deletingId === anni.id} className="flex items-center gap-1.5 text-xs text-error font-medium opacity-60 hover:opacity-100 transition-opacity !bg-transparent !border-0">
                        {deletingId === anni.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        Xóa
                      </button>
                      <button onClick={() => navigate(`/relo/anniversaries/edit/${anni.id}`)} className="flex items-center gap-1.5 text-xs text-primary font-medium opacity-70 hover:opacity-100 transition-opacity !bg-transparent !border-0">
                        ✏️ Chỉnh sửa
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
      <div className="h-4" />
    </div>
  )
}

export default Anniversaries
