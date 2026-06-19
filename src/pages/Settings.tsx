import React from 'react'
import { LogOut, ChevronRight, Camera, Sparkles, Shield, Palette, Moon, Sun, Bell, Target, History, TrendingUp, Home, Receipt, BarChart3, Wallet, PiggyBank, Users } from 'lucide-react'
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

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.user_metadata?.full_name || user?.email || 'U'
    )}&background=4f6ef7&color=fff&bold=true&size=128`

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  const iconMap: Record<string, React.ReactNode> = {
    home: <Home size={18} />,
    receipt_long: <Receipt size={18} />,
    insights: <BarChart3 size={18} />,
    account_balance_wallet: <Wallet size={18} />,
    savings: <PiggyBank size={18} />,
    category: <Palette size={18} />,
    notifications: <Bell size={18} />,
    flag: <Target size={18} />,
    history: <History size={18} />,
    trending_up: <TrendingUp size={18} />,
    light_mode: <Sun size={18} />,
    dark_mode: <Moon size={18} />,
    diversity_1: <Users size={18} />,
  }

  const settingsGroups = [
    {
      title: 'Tùy chỉnh',
      accent: 'violet',
      items: [
        {
          label: 'Danh mục chi tiêu',
          icon: 'category',
          path: '/settings/categories',
          iconBg: 'from-primary to-primary/80',
        },
        {
          label: 'Cấu hình thông báo',
          icon: 'notifications',
          path: '/settings/notifications',
          iconBg: 'from-violet-500 to-violet-600',
        },
        {
          label: 'Mục tiêu tích lũy',
          icon: 'flag',
          path: '/goals',
          iconBg: 'from-green-500 to-green-600',
        },
        {
          label: 'Lịch sử ngân sách',
          icon: 'history',
          path: '/settings/budget-history',
          iconBg: 'from-rose-500 to-rose-600',
        },
        {
          label: 'Biến động số dư',
          icon: 'trending_up',
          path: '/settings/balance-history',
          iconBg: 'from-cyan-500 to-cyan-600',
        },
        {
          label: isDarkMode ? 'Chế độ sáng' : 'Chế độ tối',
          icon: isDarkMode ? 'light_mode' : 'dark_mode',
          onClick: toggleTheme,
          iconBg: isDarkMode
            ? 'from-amber-400 to-amber-500'
            : 'from-slate-600 to-slate-700',
        },
      ],
    },
    {
      title: 'Liên kết nhanh',
      accent: 'blue',
      items: [
        {
          label: 'Trang chủ',
          icon: 'home',
          path: '/',
          iconBg: 'from-blue-500 to-blue-600',
        },
        {
          label: 'Sổ giao dịch',
          icon: 'receipt_long',
          path: '/ledger',
          iconBg: 'from-indigo-500 to-indigo-600',
        },
        {
          label: 'Thống kê',
          icon: 'insights',
          path: '/stats',
          iconBg: 'from-violet-500 to-violet-600',
        },
        {
          label: 'Ví tiền',
          icon: 'account_balance_wallet',
          path: '/wallet',
          iconBg: 'from-emerald-500 to-emerald-600',
        },
        {
          label: 'Kế hoạch chi tiêu',
          icon: 'savings',
          path: '/budget',
          iconBg: 'from-amber-500 to-amber-600',
        },
      ],
    },
    {
      title: 'Ứng dụng mở rộng',
      accent: 'rose',
      items: [
        {
          label: 'Relo',
          icon: 'diversity_1',
          path: '/relo',
          iconBg: 'from-rose-500 to-rose-600',
        },
      ],
    },
  ]

  return (
    <div className="max-w-xl mx-auto md:max-w-none space-y-7 pb-10">
      {/* ── Page Header ─────────────────────────────── */}
      <div className="relative">
        <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
          Cài đặt
        </h1>
        <p className="text-sm text-on-surface-variant/60 mt-1">
          Quản lý tài khoản và tùy chỉnh ứng dụng
        </p>
      </div>

      {/* ── Profile Card ─────────────────────────── */}
      <div className="relative group">
        {/* Gradient background glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20 rounded-3xl blur-sm opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        <div className="relative bg-surface-container-lowest/90 backdrop-blur-xl rounded-3xl border border-white/10 dark:border-white/5 shadow-xl overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-violet-500 to-primary" />

          <div className="p-6 flex items-center gap-5">
            {/* Avatar with glow ring */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary to-violet-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-[72px] h-[72px] rounded-2xl object-cover ring-2 ring-white/20 dark:ring-white/10"
                />
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg hover:brightness-110 active:scale-90 transition-all duration-200">
                  <Camera size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <p className="font-headline font-bold text-lg text-on-surface truncate">
                {displayName}
              </p>
              <p className="text-sm text-on-surface-variant/60 truncate mt-0.5">
                {user?.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-[11px] bg-gradient-to-r from-primary/15 to-violet-500/15 text-primary font-semibold px-3 py-1 rounded-full">
                  <Sparkles size={11} />
                  Pro Account
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1 rounded-full">
                  <Shield size={11} />
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Settings Groups ─────────────────────── */}
      {settingsGroups.map((group, gIdx) => (
        <div
          key={gIdx}
          className="space-y-2.5 animate-in slide-in-from-bottom-4"
          style={{ animationDelay: `${gIdx * 80}ms` }}
        >
          <p className="text-[11px] font-bold text-on-surface-variant/50 uppercase tracking-widest px-1">
            {group.title}
          </p>
          <div className="bg-surface-container-lowest/80 backdrop-blur-sm rounded-2xl border border-outline-variant/15 overflow-hidden shadow-lg shadow-black/[0.03] dark:shadow-black/20">
            {group.items.map((item: any, iIdx) => (
              <button
                key={iIdx}
                onClick={() => {
                  if (item.onClick) item.onClick()
                  else if (item.path) navigate(item.path)
                }}
                className={cn(
                  'w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-200',
                  'hover:bg-surface-container/40 active:bg-primary/5',
                  'group/item',
                  iIdx !== group.items.length - 1 &&
                    'border-b border-outline-variant/8'
                )}
              >
                {/* Gradient icon */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 text-white shadow-md transition-transform duration-200 group-hover/item:scale-105 group-active/item:scale-95',
                    item.iconBg
                  )}
                >
                  {iconMap[item.icon] || (
                    <span className="material-symbols-outlined text-[18px]">
                      {item.icon}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className="flex-1 text-[15px] font-medium text-on-surface">
                  {item.label}
                </span>

                {/* Chevron */}
                {!item.onClick && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-outline-variant/10 group-hover/item:bg-primary/10 transition-colors">
                    <ChevronRight
                      size={16}
                      className="text-on-surface-variant/40 group-hover/item:text-primary transition-colors"
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* ── Sign Out ─────────────────────────────── */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-red-500/15 bg-red-500/5 text-red-500 dark:text-red-400 text-sm font-semibold hover:bg-red-500/10 hover:border-red-500/25 active:scale-[0.98] transition-all duration-200 group"
      >
        <LogOut
          size={17}
          strokeWidth={2}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        Đăng xuất
      </button>

      {/* ── Footer ─────────────────────────────── */}
      <div className="text-center pt-2 pb-4">
        <p className="text-[11px] font-medium text-on-surface-variant/30 tracking-wide">
          PocketFlow · Version 1.0.5
        </p>
      </div>
    </div>
  )
}

export default Settings
