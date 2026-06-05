import React, { useState } from 'react'
import { LogOut, ChevronRight, Camera, Bell, BellOff, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useThemeStore } from '@/store/useThemeStore'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useNotificationSettings } from '@/features/notifications/useNotificationSettings'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* ─── Tiny Toggle Switch ─────────────────────────────────────── */
interface ToggleSwitchProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
      checked ? 'bg-primary' : 'bg-surface-container',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    <span
      className={cn(
        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out',
        checked ? 'translate-x-5' : 'translate-x-0'
      )}
    />
  </button>
)

/* ─── Notification Settings Section ─────────────────────────── */
const NotificationSection: React.FC = () => {
  const { settings, saveSettings, isSaving } = useNotificationSettings()
  const [saved, setSaved] = useState(false)

  const handleChange = <K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K]
  ) => {
    saveSettings({ ...settings, [key]: value })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const isDisabled = !settings.enabled

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold text-on-surface-variant/60 uppercase tracking-wider px-1">
        Thông báo
      </p>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden shadow-card divide-y divide-outline-variant/10">

        {/* Master toggle */}
        <div className="flex items-center gap-3.5 px-4 py-3.5">
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
            settings.enabled ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant/50'
          )}>
            {settings.enabled ? <Bell size={18} /> : <BellOff size={18} />}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-on-surface">Bật thông báo</span>
            <p className="text-[11px] text-on-surface-variant/60 mt-0.5">
              Nhận thông báo realtime từ ứng dụng
            </p>
          </div>
          <ToggleSwitch
            checked={settings.enabled}
            onChange={(v) => handleChange('enabled', v)}
          />
        </div>

        {/* Due date reminder */}
        <div className={cn('flex items-center gap-3.5 px-4 py-3.5', isDisabled && 'opacity-50')}>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              alarm
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-on-surface">Nhắc hạn trả nợ</span>
            <p className="text-[11px] text-on-surface-variant/60 mt-0.5">
              Thông báo khi khoản vay sắp đến hạn
            </p>
          </div>
          <ToggleSwitch
            checked={settings.due_date_reminder}
            onChange={(v) => handleChange('due_date_reminder', v)}
            disabled={isDisabled}
          />
        </div>

        {/* Reminder days — only when due_date_reminder is on */}
        {settings.due_date_reminder && !isDisabled && (
          <div className="px-4 py-3.5 bg-amber-500/3">
            <p className="text-[10px] font-semibold text-amber-600/80 uppercase tracking-wider mb-3">
              Nhắc trước bao nhiêu ngày?
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 5, 7].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleChange('due_date_reminder_days', d)}
                  className={cn(
                    'flex-1 h-9 rounded-xl text-sm font-semibold transition-all',
                    settings.due_date_reminder_days === d
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-surface-container text-on-surface-variant/70 hover:bg-amber-500/10 hover:text-amber-600'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-on-surface-variant/50 mt-2 text-center">
              Nhắc trước <strong>{settings.due_date_reminder_days}</strong> ngày so với ngày đến hạn
            </p>
          </div>
        )}

        {/* Budget alert */}
        <div className={cn('flex items-center gap-3.5 px-4 py-3.5', isDisabled && 'opacity-50')}>
          <div className="w-9 h-9 rounded-xl bg-error/10 text-error flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-on-surface">Cảnh báo ngân sách</span>
            <p className="text-[11px] text-on-surface-variant/60 mt-0.5">
              Thông báo khi chi tiêu vượt ngưỡng
            </p>
          </div>
          <ToggleSwitch
            checked={settings.budget_alert}
            onChange={(v) => handleChange('budget_alert', v)}
            disabled={isDisabled}
          />
        </div>

        {/* Budget threshold */}
        {settings.budget_alert && !isDisabled && (
          <div className="px-4 py-3.5 bg-error/3">
            <p className="text-[10px] font-semibold text-error/70 uppercase tracking-wider mb-3">
              Cảnh báo khi vượt ngưỡng (%)
            </p>
            <div className="flex gap-2">
              {[60, 70, 80, 90].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleChange('budget_alert_threshold', pct)}
                  className={cn(
                    'flex-1 h-9 rounded-xl text-sm font-semibold transition-all',
                    settings.budget_alert_threshold === pct
                      ? 'bg-error text-white shadow-sm'
                      : 'bg-surface-container text-on-surface-variant/70 hover:bg-error/10 hover:text-error'
                  )}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <p className="text-[10px] text-on-surface-variant/50 mt-2 text-center">
              Cảnh báo khi chi đến <strong>{settings.budget_alert_threshold}%</strong> ngân sách ngày
            </p>
          </div>
        )}

        {/* Daily summary */}
        <div className={cn('flex items-center gap-3.5 px-4 py-3.5', isDisabled && 'opacity-50')}>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              summarize
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-on-surface">Tóm tắt hàng ngày</span>
            <p className="text-[11px] text-on-surface-variant/60 mt-0.5">
              Nhận tóm tắt chi tiêu mỗi buổi sáng
            </p>
          </div>
          <ToggleSwitch
            checked={settings.daily_summary}
            onChange={(v) => handleChange('daily_summary', v)}
            disabled={isDisabled}
          />
        </div>

        {/* Daily summary time */}
        {settings.daily_summary && !isDisabled && (
          <div className="px-4 py-3.5 bg-indigo-500/3">
            <p className="text-[10px] font-semibold text-indigo-500/80 uppercase tracking-wider mb-2">
              Giờ nhận tóm tắt
            </p>
            <input
              type="time"
              value={settings.daily_summary_time}
              onChange={(e) => handleChange('daily_summary_time', e.target.value)}
              className="w-full bg-surface-container rounded-xl px-3 py-2 text-sm font-semibold text-on-surface border border-outline-variant/20 focus:ring-0 focus:border-primary/40"
            />
          </div>
        )}
      </div>

      {/* Save confirmation */}
      {(isSaving || saved) && (
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all',
          saved ? 'bg-secondary/10 text-secondary' : 'bg-surface-container text-on-surface-variant/60'
        )}>
          {saved ? (
            <>
              <CheckCircle2 size={14} />
              Đã lưu cài đặt thông báo
            </>
          ) : (
            <>
              <span className="w-3.5 h-3.5 border-2 border-on-surface-variant/30 border-t-primary rounded-full animate-spin" />
              Đang lưu...
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Main Settings Page ─────────────────────────────────────── */
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
        { label: 'Danh mục chi tiêu', icon: 'category',    path: '/settings/categories',       iconBg: 'bg-primary/10 text-primary' },
        { label: 'Mục tiêu tích lũy', icon: 'flag',        path: '/goals',                     iconBg: 'bg-green-600/10 text-green-600' },
        { label: 'Lịch sử ngân sách', icon: 'history',     path: '/settings/budget-history',   iconBg: 'bg-secondary/10 text-secondary' },
        { label: 'Biến động số dư',   icon: 'trending_up', path: '/settings/balance-history',  iconBg: 'bg-primary/10 text-primary' },
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

      {/* ── Notification Settings ────────────────── */}
      <NotificationSection />

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
