import React from 'react'
import { LogOut, ChevronRight, Camera } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useThemeStore } from '@/store/useThemeStore'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const Settings: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { isDarkMode, toggleTheme } = useThemeStore()

  const avatarUrl = user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.user_metadata?.full_name || user?.email || 'U'
    )}&background=4f6ef7&color=fff&bold=true&size=128`

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  const settingsGroups = [
    {
      title: 'Liên kết nhanh',
      items: [
        { label: 'Trang chủ',         icon: 'home',                    path: '/',              iconBg: 'bg-blue-500/10 text-blue-500' },
        { label: 'Sổ giao dịch',      icon: 'receipt_long',            path: '/ledger',        iconBg: 'bg-indigo-500/10 text-indigo-500' },
        { label: 'Thống kê',          icon: 'insights',                path: '/stats',         iconBg: 'bg-violet-500/10 text-violet-500' },
        { label: 'Ví tiền',           icon: 'account_balance_wallet',  path: '/wallet',        iconBg: 'bg-emerald-500/10 text-emerald-500' },
        { label: 'Kế hoạch chi tiêu', icon: 'savings',                 path: '/budget',        iconBg: 'bg-amber-500/10 text-amber-500' },
      ]
    },
    {
      title: 'Tùy chỉnh',
      items: [
        { label: 'Danh mục chi tiêu', icon: 'category',      path: '/settings/categories',       iconBg: 'bg-primary/10 text-primary' },
        { label: 'Cấu hình thông báo', icon: 'notifications', path: '/settings/notifications',     iconBg: 'bg-violet-600/10 text-violet-600' },
        { label: 'Mục tiêu tích lũy', icon: 'flag',          path: '/goals',                     iconBg: 'bg-green-600/10 text-green-600' },
        { label: 'Lịch sử ngân sách', icon: 'history',       path: '/settings/budget-history',   iconBg: 'bg-secondary/10 text-secondary' },
        { label: 'Biến động số dư',   icon: 'trending_up',   path: '/settings/balance-history',  iconBg: 'bg-primary/10 text-primary' },
        {
          label: isDarkMode ? 'Chế độ sáng' : 'Chế độ tối',
          icon: isDarkMode ? 'light_mode' : 'dark_mode',
          onClick: toggleTheme,
          iconBg: isDarkMode ? 'bg-amber-400/10 text-amber-500' : 'bg-slate-600/10 text-slate-600 dark:text-slate-300',
        },
      ]
    },
    {
      title: 'Ứng dụng mở rộng',
      items: [
        { label: 'Relo', icon: 'diversity_1', path: '/relo', iconBg: 'bg-rose-500/10 text-rose-500' },
      ]
    },
  ]

  return (
    <div className="max-w-xl mx-auto md:max-w-none space-y-6 pb-8">

      {/* ── Page Title ─────────────────────────────── */}
      <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
        Cài đặt
      </h1>

      {/* ── Profile Card ─────────────────────────── */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-card p-5 flex items-center gap-4">
        <div className="relative">
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/15"
          />
          <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-primary text-white rounded-xl flex items-center justify-center shadow-sm hover:brightness-105 active:scale-95 transition-all">
            <Camera size={13} strokeWidth={2.5} />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-headline font-bold text-base text-on-surface truncate">
            {displayName}
          </p>
          <p className="text-xs text-on-surface-variant/70 truncate mt-0.5">
            {user?.email}
          </p>
          <span className="inline-block mt-1.5 text-[10px] bg-primary/8 text-primary font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Pro Account
          </span>
        </div>
      </div>

      {/* ── Settings Groups ─────────────────────── */}
      {settingsGroups.map((group, gIdx) => (
        <div key={gIdx} className="space-y-2">
          <p className="text-[11px] font-semibold text-on-surface-variant/60 uppercase tracking-wider px-1">
            {group.title}
          </p>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden shadow-card divide-y divide-outline-variant/10">
            {group.items.map((item: any, iIdx) => (
              <button
                key={iIdx}
                onClick={() => {
                  if (item.onClick) item.onClick()
                  else if (item.path) navigate(item.path)
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-surface-container/50 active:bg-primary/5 transition-colors text-left"
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                  item.iconBg
                )}>
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {item.icon}
                  </span>
                </div>
                <span className="flex-1 text-sm font-medium text-on-surface">
                  {item.label}
                </span>
                {!item.onClick && (
                  <ChevronRight size={16} className="text-on-surface-variant/40" />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* ── Sign Out ─────────────────────────────── */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border border-error/20 text-error text-sm font-semibold hover:bg-error/5 active:scale-[0.98] transition-all"
      >
        <LogOut size={16} strokeWidth={2} />
        Đăng xuất
      </button>

      {/* Footer */}
      <div className="text-center py-4 opacity-40">
        <p className="text-xs font-medium text-on-surface-variant">
          PocketFlow · Version 1.0.5
        </p>
      </div>
    </div>
  )
}

export default Settings
