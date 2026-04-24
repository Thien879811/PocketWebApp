import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, MapPin, Trash2, Loader2, Check, Clock, X } from 'lucide-react'
import { useReloAppointments, useDeleteReloAppointment, useUpdateReloAppointment } from '../features/useReloData'

const statusConfig = {
  upcoming: { label: 'Sắp tới', cls: 'bg-primary-container text-primary dark:bg-primary/20' },
  completed: { label: 'Đã xong', cls: 'bg-secondary-container text-secondary dark:bg-secondary/20' },
  cancelled: { label: 'Đã huỷ', cls: 'bg-surface-container-high text-outline dark:bg-surface-container-highest' },
}

const Appointments: React.FC = () => {
  const navigate = useNavigate()
  const { data: appointments, isLoading } = useReloAppointments()
  const deleteMutation = useDeleteReloAppointment()
  const updateMutation = useUpdateReloAppointment()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming')

  const filtered = appointments?.filter((a) => a.status === activeTab) ?? []

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa lịch hẹn này?')) return
    setDeletingId(id)
    try { await deleteMutation.mutateAsync(id) }
    finally { setDeletingId(null) }
  }

  const handleUpdateStatus = async (id: string, newStatus: 'upcoming' | 'completed' | 'cancelled') => {
    const appt = appointments?.find(a => a.id === id)
    if (!appt || appt.status === newStatus) return
    
    setUpdatingId(id)
    try {
      await updateMutation.mutateAsync({
        id,
        status: newStatus,
        title: appt.title,
        description: appt.description,
        location: appt.location,
        appointment_date: appt.appointment_date,
        appointment_time: appt.appointment_time,
        contact_id: appt.contact_id,
      })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Lịch hẹn</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{appointments?.length || 0} sự kiện</p>
        </div>
        <button
          onClick={() => navigate('/relo/events/create')}
          className="w-11 h-11 !bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md shadow-primary/30 active:scale-90 transition-transform"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-surface-container dark:bg-surface-container-low p-1 rounded-[12px]">
        {(['upcoming', 'completed', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-semibold rounded-[10px] transition-all !border-0 ${
              activeTab === tab ? '!bg-surface-container-lowest dark:!bg-surface-container-high text-primary shadow-sm' : '!bg-transparent text-on-surface-variant'
            }`}
          >
            {statusConfig[tab].label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-primary/40" />
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary-container/50 dark:bg-primary/15 flex items-center justify-center mb-3">
            <Calendar size={28} className="text-primary/40" />
          </div>
          <p className="text-sm font-medium text-on-surface">Chưa có lịch hẹn nào</p>
          <p className="text-xs text-on-surface-variant mt-1">Thêm lịch hẹn để bắt đầu theo dõi</p>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <div key={appt.id} className="bg-surface-container-lowest dark:bg-surface-container rounded-[16px] border border-outline-variant/20 dark:border-outline-variant/10 shadow-sm dark:shadow-dark overflow-hidden">
              <div className="p-4 flex items-start gap-3 cursor-pointer" onClick={() => navigate(`/relo/events/edit/${appt.id}`)}>
                <div className="flex-shrink-0 w-12 h-14 bg-primary-container/50 dark:bg-primary/15 rounded-[12px] flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-primary leading-none">
                    {new Date(appt.appointment_date).getDate()}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wide">
                    {new Date(appt.appointment_date).toLocaleDateString('vi-VN', { month: 'short' })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-on-surface text-sm leading-snug">{appt.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold flex-shrink-0 ${statusConfig[appt.status].cls}`}>
                      {statusConfig[appt.status].label}
                    </span>
                  </div>
                  {appt.relo_contacts?.name && <p className="text-xs text-on-surface-variant mt-0.5">với {appt.relo_contacts.name}</p>}
                  {appt.appointment_time && <p className="text-xs text-outline mt-1">🕐 {appt.appointment_time.slice(0, 5)}</p>}
                  {appt.location && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={11} className="text-outline" />
                      <p className="text-xs text-outline truncate">{appt.location}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-outline-variant/15 dark:border-outline-variant/10 px-4 py-2 flex items-center justify-between gap-2">
                <div className="flex gap-1 flex-1">
                  <button 
                    onClick={() => handleUpdateStatus(appt.id, 'upcoming')}
                    disabled={updatingId === appt.id || appt.status === 'upcoming'}
                    className={`flex-1 py-1.5 px-2 rounded-[8px] text-xs font-medium transition-all flex items-center justify-center gap-1 !border-0 ${
                      appt.status === 'upcoming'
                        ? '!bg-primary-container text-primary dark:!bg-primary/20'
                        : '!bg-surface-container dark:!bg-surface-container-high text-on-surface-variant hover:!bg-primary/10'
                    }`}
                    title="Đánh dấu sắp tới"
                  >
                    {updatingId === appt.id ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
                    <span className="hidden sm:inline">Sắp tới</span>
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(appt.id, 'completed')}
                    disabled={updatingId === appt.id || appt.status === 'completed'}
                    className={`flex-1 py-1.5 px-2 rounded-[8px] text-xs font-medium transition-all flex items-center justify-center gap-1 !border-0 ${
                      appt.status === 'completed'
                        ? '!bg-secondary-container text-secondary dark:!bg-secondary/20'
                        : '!bg-surface-container dark:!bg-surface-container-high text-on-surface-variant hover:!bg-secondary/10'
                    }`}
                    title="Đánh dấu đã xong"
                  >
                    {updatingId === appt.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    <span className="hidden sm:inline">Xong</span>
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                    disabled={updatingId === appt.id || appt.status === 'cancelled'}
                    className={`flex-1 py-1.5 px-2 rounded-[8px] text-xs font-medium transition-all flex items-center justify-center gap-1 !border-0 ${
                      appt.status === 'cancelled'
                        ? '!bg-surface-container-high text-error dark:!bg-error/20'
                        : '!bg-surface-container dark:!bg-surface-container-high text-on-surface-variant hover:!bg-error/10'
                    }`}
                    title="Đánh dấu đã huỷ"
                  >
                    {updatingId === appt.id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                    <span className="hidden sm:inline">Huỷ</span>
                  </button>
                </div>
                <button onClick={() => handleDelete(appt.id)} disabled={deletingId === appt.id} className="p-1.5 rounded-full hover:bg-error-container/30 dark:hover:bg-error/10 transition-colors !bg-transparent !border-0" title="Xóa">
                  {deletingId === appt.id ? <Loader2 size={14} className="animate-spin text-error" /> : <Trash2 size={14} className="text-error opacity-40 hover:opacity-100 transition-opacity" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="h-4" />
    </div>
  )
}

export default Appointments
