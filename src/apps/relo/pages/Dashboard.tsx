import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Heart, Calendar, Gift, ChevronRight, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useReloAnniversaries, useReloAppointments, daysUntilAnniversary } from '../features/useReloData'

const getAvatarUrl = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2dfff&color=3525cd&bold=true&size=128`

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const displayName = user?.user_metadata?.full_name?.split(' ').slice(-1)[0] || user?.email?.split('@')[0] || 'bạn'

  const { data: anniversaries, isLoading: loadingAnni } = useReloAnniversaries()
  const { data: appointments, isLoading: loadingAppt } = useReloAppointments()

  const nextAnniversary = anniversaries
    ?.filter((a) => daysUntilAnniversary(a.anniversary_date) <= 30)
    .sort((a, b) => daysUntilAnniversary(a.anniversary_date) - daysUntilAnniversary(b.anniversary_date))[0]

  const upcomingAppts = appointments?.filter((a) => a.status === 'upcoming').slice(0, 3) || []
  const isLoading = loadingAnni || loadingAppt

  return (
    <div className="px-4 py-6 space-y-6">

      {/* ── WELCOME ── */}
      <section className="flex items-center justify-between">
        <div>
          <p className="text-sm text-on-surface-variant">Xin chào,</p>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight leading-tight">
            {displayName} 👋
          </h1>
        </div>
        <button
          onClick={() => navigate('/relo/events/create')}
          className="w-11 h-11 !bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md shadow-primary/30 active:scale-90 transition-transform"
        >
          <Plus size={22} />
        </button>
      </section>

      {/* ── NURTURE CARD ── */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={28} className="animate-spin text-primary/40" />
        </div>
      ) : nextAnniversary ? (
        <section
          className="relative rounded-[20px] p-5 overflow-hidden cursor-pointer"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--tertiary) 100%)' }}
          onClick={() => navigate('/relo/anniversaries')}
        >
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full" />
          <div className="absolute -right-4 top-12 w-20 h-20 bg-white/5 rounded-full" />
          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-white/80 fill-white/40" />
                <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Sắp đến</span>
              </div>
              <h2 className="text-lg font-semibold text-white leading-snug">{nextAnniversary.title}</h2>
              {nextAnniversary.relo_contacts?.name && (
                <p className="text-sm text-white/70">với {nextAnniversary.relo_contacts.name}</p>
              )}
            </div>
            <div className="bg-white/15 rounded-2xl px-3 py-2 text-center backdrop-blur-sm">
              <span className="text-2xl font-bold text-white block">{daysUntilAnniversary(nextAnniversary.anniversary_date)}</span>
              <span className="text-[10px] text-white/70 font-medium uppercase tracking-wide">ngày nữa</span>
            </div>
          </div>
        </section>
      ) : (
        <section
          className="relative rounded-[20px] p-5 overflow-hidden cursor-pointer"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--tertiary) 100%)' }}
          onClick={() => navigate('/relo/anniversaries')}
        >
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <Heart size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Thêm kỷ niệm đầu tiên</h2>
              <p className="text-sm text-white/70">Lưu giữ những ngày đặc biệt</p>
            </div>
          </div>
        </section>
      )}

      {/* ── QUICK STATS ── */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { label: 'Kỷ niệm', count: anniversaries?.length || 0, icon: Heart, path: '/relo/anniversaries' },
          { label: 'Lịch hẹn', count: upcomingAppts.length, icon: Calendar, path: '/relo/appointments' },
          { label: 'Sở thích', count: 0, icon: Gift, path: '/relo/preferences' },
        ].map((stat, i) => (
          <button
            key={i}
            onClick={() => navigate(stat.path)}
            className="bg-surface-container-lowest dark:bg-surface-container rounded-[16px] border border-outline-variant/20 dark:border-outline-variant/10 p-4 flex flex-col items-center gap-2 active:scale-[0.97] transition-transform shadow-sm dark:shadow-dark"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-container dark:bg-primary/15">
              <stat.icon size={18} className="text-primary" />
            </div>
            <span className="text-xl font-bold text-on-surface">{stat.count}</span>
            <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wide text-center">{stat.label}</span>
          </button>
        ))}
      </section>

      {/* ── UPCOMING APPOINTMENTS ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-on-surface">Lịch hẹn sắp tới</h2>
          <button
            onClick={() => navigate('/relo/appointments')}
            className="text-xs font-medium text-primary px-3 py-1 !bg-primary-container/50 dark:!bg-primary/10 rounded-full hover:!bg-primary-container dark:hover:!bg-primary/20 transition-colors !border-0"
          >
            Xem tất cả
          </button>
        </div>

        {upcomingAppts.length === 0 ? (
          <button
            onClick={() => navigate('/relo/events/create')}
            className="w-full bg-surface-container-lowest dark:bg-surface-container border border-dashed border-outline-variant/40 dark:border-outline-variant/20 rounded-[16px] p-6 flex flex-col items-center gap-3 text-center active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-primary-container/50 dark:bg-primary/15 flex items-center justify-center">
              <Plus size={22} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface">Thêm lịch hẹn đầu tiên</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Ghi lại những khoảnh khắc bên nhau</p>
            </div>
          </button>
        ) : (
          <div className="space-y-3">
            {upcomingAppts.map((appt) => (
              <button
                key={appt.id}
                onClick={() => navigate('/relo/appointments')}
                className="w-full bg-surface-container-lowest dark:bg-surface-container p-4 rounded-[16px] border border-outline-variant/20 dark:border-outline-variant/10 shadow-sm dark:shadow-dark flex items-center justify-between group hover:border-primary/30 dark:hover:border-primary/20 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-[12px] bg-primary-container dark:bg-primary/15 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {appt.relo_contacts?.avatar_url ? (
                      <img src={appt.relo_contacts.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : appt.relo_contacts?.name ? (
                      <img src={getAvatarUrl(appt.relo_contacts.name)} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <Calendar size={20} className="text-primary" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-on-surface">{appt.title}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {new Date(appt.appointment_date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: 'short' })}
                      {appt.appointment_time && ` · ${appt.appointment_time.slice(0, 5)}`}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-outline-variant group-hover:text-primary transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── ANNIVERSARIES SECTION ── */}
      {anniversaries && anniversaries.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-on-surface">Kỷ niệm sắp tới</h2>
            <button
              onClick={() => navigate('/relo/anniversaries')}
              className="text-xs font-medium text-primary px-3 py-1 !bg-primary-container/50 dark:!bg-primary/10 rounded-full hover:!bg-primary-container dark:hover:!bg-primary/20 transition-colors !border-0"
            >
              Xem tất cả
            </button>
          </div>
          <div className="space-y-3">
            {anniversaries.slice(0, 3).map((anni) => {
              const daysLeft = daysUntilAnniversary(anni.anniversary_date)
              return (
                <div
                  key={anni.id}
                  className="bg-surface-container-lowest dark:bg-surface-container p-4 rounded-[16px] border border-outline-variant/20 dark:border-outline-variant/10 shadow-sm dark:shadow-dark flex items-center gap-3"
                >
                  <div className="w-11 h-11 rounded-full bg-error-container dark:bg-error/15 flex items-center justify-center flex-shrink-0">
                    <Heart size={18} className="text-error fill-error/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{anni.title}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {new Date(anni.anniversary_date).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long' })}
                    </p>
                  </div>
                  <div className={`rounded-full px-2.5 py-1 text-xs font-semibold flex-shrink-0 ${daysLeft === 0 ? 'bg-error text-on-error' : daysLeft <= 7 ? 'bg-error-container text-error dark:bg-error/20 dark:text-error' : 'bg-primary-container text-primary dark:bg-primary/20'}`}>
                    {daysLeft === 0 ? 'Hôm nay!' : `${daysLeft} ngày`}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <div className="h-4" />
    </div>
  )
}

export default Dashboard
