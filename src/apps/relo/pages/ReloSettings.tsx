import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ArrowLeft, ChevronRight, Heart, Shield, Bell } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useReloContacts, useReloAnniversaries, useReloAppointments } from '../features/useReloData'

const ReloSettings: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { data: contacts } = useReloContacts()
  const { data: anniversaries } = useReloAnniversaries()
  const { data: appointments } = useReloAppointments()

  const avatarUrl = user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || user?.email || 'User')}&background=e2dfff&color=3525cd&bold=true`
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  const settingItems = [
    {
      section: 'Dữ liệu',
      items: [
        { icon: Heart, label: 'Người thân', value: `${contacts?.length || 0} người`, path: '/relo/contacts', cls: 'bg-error-container text-error dark:bg-error/15' },
        { icon: Heart, label: 'Kỷ niệm', value: `${anniversaries?.length || 0} ngày`, path: '/relo/anniversaries', cls: 'bg-primary-container text-primary dark:bg-primary/15' },
        { icon: Heart, label: 'Lịch hẹn', value: `${appointments?.length || 0} sự kiện`, path: '/relo/appointments', cls: 'bg-tertiary-container text-tertiary dark:bg-tertiary/15' },
      ],
    },
    {
      section: 'Ứng dụng',
      items: [
        { icon: Bell, label: 'Thông báo', value: 'Đang bật', path: null, cls: 'bg-secondary-container text-secondary dark:bg-secondary/15' },
        { icon: Shield, label: 'Quyền riêng tư', value: '', path: null, cls: 'bg-surface-container-high text-on-surface-variant' },
      ],
    },
  ]

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Profile card */}
      <div className="bg-surface-container dark:bg-surface-container-low rounded-[20px] p-5 border border-outline-variant/15 dark:border-outline-variant/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-surface-container-lowest dark:border-surface-container shadow-md flex-shrink-0">
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-on-surface text-lg leading-snug truncate">{displayName}</h2>
            <p className="text-xs text-on-surface-variant mt-0.5 truncate">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Heart size={12} className="text-error fill-error/40" />
              <span className="text-xs text-on-surface-variant font-medium">Relo Member</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: 'Người thân', count: contacts?.length || 0 },
            { label: 'Kỷ niệm', count: anniversaries?.length || 0 },
            { label: 'Lịch hẹn', count: appointments?.length || 0 },
          ].map((stat, i) => (
            <div key={i} className="bg-surface-container-lowest/60 dark:bg-surface-container rounded-[12px] px-2 py-2.5 text-center">
              <span className="text-xl font-bold text-primary block">{stat.count}</span>
              <span className="text-[10px] text-on-surface-variant font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Settings sections */}
      {settingItems.map((section) => (
        <section key={section.section}>
          <h2 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-3 px-1">{section.section}</h2>
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[16px] border border-outline-variant/20 dark:border-outline-variant/10 shadow-sm dark:shadow-dark divide-y divide-outline-variant/10">
            {section.items.map((item, i) => (
              <button key={i} onClick={() => item.path && navigate(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-container-high/50 dark:hover:bg-surface-container-high active:bg-surface-container-high transition-colors text-left !bg-transparent !border-0">
                <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${item.cls}`}><item.icon size={17} /></div>
                <span className="flex-1 text-sm font-medium text-on-surface">{item.label}</span>
                {item.value && <span className="text-xs text-outline">{item.value}</span>}
                {item.path && <ChevronRight size={16} className="text-outline-variant flex-shrink-0" />}
              </button>
            ))}
          </div>
        </section>
      ))}

      {/* Về PocketFlow */}
      <div>
        <h2 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-3 px-1">Điều hướng</h2>
        <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[16px] border border-outline-variant/20 dark:border-outline-variant/10 shadow-sm dark:shadow-dark">
          <button onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-container-high/50 dark:hover:bg-surface-container-high transition-colors text-left !bg-transparent !border-0">
            <div className="w-9 h-9 rounded-[10px] bg-primary-container dark:bg-primary/15 flex items-center justify-center flex-shrink-0"><ArrowLeft size={17} className="text-primary" /></div>
            <div className="flex-1"><p className="text-sm font-medium text-on-surface">Về PocketFlow</p><p className="text-xs text-outline">Quay lại ứng dụng chính</p></div>
            <ChevronRight size={16} className="text-outline-variant" />
          </button>
        </div>
      </div>

      <button onClick={logout}
        className="w-full !bg-error-container/50 dark:!bg-error/15 !border !border-error/20 dark:!border-error/10 text-error py-4 rounded-[14px] font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
        <LogOut size={18} />
        Đăng xuất
      </button>

      <div className="text-center opacity-30 pb-4">
        <p className="text-xs font-semibold text-primary italic">Relo · Relationship Management</p>
        <p className="text-[10px] text-on-surface-variant mt-0.5">v1.0.0 · Powered by PocketFlow</p>
      </div>
    </div>
  )
}

export default ReloSettings
