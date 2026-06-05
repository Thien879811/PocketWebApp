import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  BellOff,
  Clock,
  Calendar,
  Sparkles,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Plus,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useNotificationSettings } from '@/features/notifications/useNotificationSettings'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase'
import toast from 'react-hot-toast'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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

const NotificationSettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const { settings, saveSettings, isSaving } = useNotificationSettings()

  const [saved, setSaved] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  )

  // Custom notification form states
  const [customTitle, setCustomTitle] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [customTime, setCustomTime] = useState('')

  // Query custom scheduled notifications
  const { data: scheduledList, isLoading: isListLoading } = useQuery({
    queryKey: ['scheduled_notifications', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('scheduled_at', { ascending: true })
      if (error) throw error
      return data
    },
  })

  // Mutation to schedule custom notification
  const { mutate: scheduleNotification, isPending: isScheduling } = useMutation({
    mutationFn: async (newNotif: { title: string; message: string; scheduled_at: string }) => {
      if (!user?.id) throw new Error('Not authenticated')
      const { error } = await supabase.from('scheduled_notifications').insert({
        ...newNotif,
        user_id: user.id,
        sent: false,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled_notifications', user?.id] })
      setCustomTitle('')
      setCustomMessage('')
      setCustomTime('')
      toast.success('Hẹn giờ thông báo thành công!')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi đặt lịch thông báo')
    },
  })

  // Mutation to delete a scheduled notification
  const { mutate: deleteScheduled } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('scheduled_notifications').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled_notifications', user?.id] })
      toast.success('Đã hủy lịch thông báo')
    },
  })

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Trình duyệt của bạn không hỗ trợ thông báo hệ thống.')
      return
    }
    const res = await Notification.requestPermission()
    setPermissionStatus(res)
    if (res === 'granted') {
      toast.success('Tuyệt vời! Bạn đã cho phép hiển thị thông báo hệ thống.')
      // Verify service worker registration
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready
          console.log('Service Worker is ready:', reg)
        } catch (err) {
          console.error('Service Worker registration check failed:', err)
        }
      }
    } else if (res === 'denied') {
      toast.error('Yêu cầu bị từ chối. Vui lòng bật lại trong cài đặt trình duyệt của bạn.')
    }
  }

  const handleSendTestNotification = async () => {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      toast.error('Trình duyệt không hỗ trợ Service Worker / Notification.')
      return
    }
    
    if (permissionStatus !== 'granted') {
      toast.error('Vui lòng cấp quyền thông báo hệ thống trước!')
      return
    }

    try {
      const reg = await navigator.serviceWorker.ready
      toast.success('Thông báo thử nghiệm qua Service Worker sẽ hiện sau 3 giây...')
      setTimeout(() => {
        reg.showNotification('Thử nghiệm PocketFlow PWA', {
          body: 'Chúc mừng! Service Worker và thông báo hệ thống hoạt động hoàn hảo.',
          icon: '/pwa-192x192.png',
          badge: '/favicon.ico',
          data: { url: '/settings/notifications' },
          vibrate: [150, 50, 150],
        } as NotificationOptions & { vibrate?: number[] })
      }, 3000)
    } catch (err: any) {
      toast.error('Lỗi gửi thông báo: ' + err.message)
    }
  }

  const handleSettingChange = <K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K]
  ) => {
    saveSettings({ ...settings, [key]: value })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customTitle.trim() || !customMessage.trim() || !customTime) {
      toast.error('Vui lòng điền đầy đủ thông tin!')
      return
    }
    const targetDate = new Date(customTime)
    if (targetDate.getTime() <= Date.now()) {
      toast.error('Thời gian thông báo phải ở trong tương lai!')
      return
    }
    scheduleNotification({
      title: customTitle,
      message: customMessage,
      scheduled_at: targetDate.toISOString(),
    })
  }

  const isDisabled = !settings.enabled

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-24">
      {/* ── Page Header ─────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container active:scale-95 transition-all text-on-surface"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-headline font-bold text-on-surface tracking-tight">
            Cấu hình thông báo
          </h1>
          <p className="text-xs text-on-surface-variant/60">
            Quản lý thông báo đẩy và thiết lập hẹn giờ tự chọn
          </p>
        </div>
      </div>

      {/* ── Web Push Permission Section ─────────── */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            permissionStatus === 'granted' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
          )}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-on-surface">Thông báo hệ thống (Web Push)</h3>
            <p className="text-xs text-on-surface-variant/70 mt-0.5 leading-relaxed">
              Trạng thái quyền:{' '}
              <span className={cn(
                'font-semibold uppercase text-[10px] px-1.5 py-0.5 rounded-full',
                permissionStatus === 'granted' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
              )}>
                {permissionStatus === 'granted' ? 'Đã cho phép' : permissionStatus === 'denied' ? 'Bị từ chối' : 'Chưa thiết lập'}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {permissionStatus === 'granted' ? (
            <button
              type="button"
              onClick={handleSendTestNotification}
              className="h-10 px-4 bg-secondary-container text-on-secondary-container rounded-xl text-xs font-semibold hover:bg-secondary-container/85 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles size={13} />
              Gửi thông báo thử
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRequestPermission}
              className="h-10 px-4 bg-primary text-white rounded-xl text-xs font-semibold hover:brightness-105 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
            >
              Yêu cầu cấp quyền
            </button>
          )}
        </div>
      </div>

      {/* ── Notification Parameters ─────────────── */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-on-surface-variant/60 uppercase tracking-wider px-1">
          Thiết lập thông báo tự động
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
              onChange={(v) => handleSettingChange('enabled', v)}
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
              onChange={(v) => handleSettingChange('due_date_reminder', v)}
              disabled={isDisabled}
            />
          </div>

          {/* Reminder days */}
          {settings.due_date_reminder && !isDisabled && (
            <div className="px-4 py-3.5 bg-amber-50/20 dark:bg-amber-950/10">
              <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-3">
                Nhắc trước bao nhiêu ngày?
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 5, 7].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleSettingChange('due_date_reminder_days', d)}
                    className={cn(
                      'flex-1 h-9 rounded-xl text-sm font-semibold transition-all',
                      settings.due_date_reminder_days === d
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-surface-container text-on-surface-variant/70 hover:bg-amber-500/10 hover:text-amber-600'
                    )}
                  >
                    {d} ngày
                  </button>
                ))}
              </div>
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
              onChange={(v) => handleSettingChange('budget_alert', v)}
              disabled={isDisabled}
            />
          </div>

          {/* Budget threshold */}
          {settings.budget_alert && !isDisabled && (
            <div className="px-4 py-3.5 bg-error-container/5 dark:bg-error-container/20">
              <p className="text-[10px] font-semibold text-error uppercase tracking-wider mb-3">
                Cảnh báo khi vượt ngưỡng (%)
              </p>
              <div className="flex gap-2">
                {[60, 70, 80, 90].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleSettingChange('budget_alert_threshold', pct)}
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
              onChange={(v) => handleSettingChange('daily_summary', v)}
              disabled={isDisabled}
            />
          </div>

          {/* Daily summary time */}
          {settings.daily_summary && !isDisabled && (
            <div className="px-4 py-3.5 bg-indigo-50/20 dark:bg-indigo-950/10">
              <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider mb-2">
                Giờ nhận tóm tắt
              </p>
              <input
                type="time"
                value={settings.daily_summary_time}
                onChange={(e) => handleSettingChange('daily_summary_time', e.target.value)}
                className="w-full bg-surface-container rounded-xl px-3 py-2 text-sm font-semibold text-on-surface border border-outline-variant/20 focus:ring-0"
              />
            </div>
          )}
        </div>

        {/* Save confirmation */}
        {(isSaving || saved) && (
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all animate-pulse',
            saved ? 'bg-green-500/10 text-green-600' : 'bg-surface-container text-on-surface-variant/60'
          )}>
            {saved ? (
              <>
                <CheckCircle2 size={14} />
                Đã lưu thay đổi tự động
              </>
            ) : (
              'Đang lưu cấu hình...'
            )}
          </div>
        )}
      </div>

      {/* ── Custom Scheduled Notification Form ──── */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-on-surface-variant/60 uppercase tracking-wider px-1">
          Hẹn giờ thông báo tự chọn
        </p>
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 shadow-card">
          <form onSubmit={handleCreateCustom} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Tiêu đề thông báo
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Đóng tiền điện, Mua sữa..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-semibold text-on-surface border border-outline-variant/10 focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-on-surface-variant/30"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Nội dung chi tiết
              </label>
              <textarea
                placeholder="Ví dụ: Nhớ thanh toán hoá đơn dịch vụ sinh hoạt kẻo bị cắt dịch vụ..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-medium text-on-surface border border-outline-variant/10 focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-on-surface-variant/30 min-h-[80px] resize-none"
                required
              />
            </div>

            {/* Time Picker */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock size={13} />
                Thời gian hiển thị
              </label>
              <input
                type="datetime-local"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-semibold text-on-surface border border-outline-variant/10 focus:ring-1 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isScheduling}
              className="w-full h-12 bg-primary text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-60 shadow-md shadow-primary/20"
            >
              {isScheduling ? 'Đang lên lịch...' : (
                <>
                  <Plus size={16} />
                  Lên lịch thông báo
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ── List of Scheduled Notifications ──────── */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <p className="text-[11px] font-semibold text-on-surface-variant/60 uppercase tracking-wider">
            Danh sách lịch hẹn
          </p>
          <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
            {scheduledList?.length || 0} thông báo
          </span>
        </div>

        {isListLoading ? (
          <div className="text-center py-6 text-xs text-on-surface-variant/60">Đang tải danh sách...</div>
        ) : !scheduledList || scheduledList.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-6 text-center text-xs text-on-surface-variant/50">
            Chưa có thông báo nào được thiết lập lịch.
          </div>
        ) : (
          <div className="space-y-2">
            {scheduledList.map((item) => {
              const targetDate = new Date(item.scheduled_at)
              const isPast = targetDate.getTime() <= Date.now()
              return (
                <div
                  key={item.id}
                  className={cn(
                    'bg-surface-container-lowest rounded-2xl border p-4 shadow-sm flex items-center justify-between gap-4 transition-all hover:bg-surface-container/20',
                    item.sent ? 'border-outline-variant/10 opacity-60' : isPast ? 'border-amber-500/20' : 'border-outline-variant/20'
                  )}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-on-surface truncate block">
                        {item.title}
                      </span>
                      {item.sent ? (
                        <span className="text-[9px] font-semibold bg-green-500/10 text-green-500 px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0">
                          Đã gửi
                        </span>
                      ) : isPast ? (
                        <span className="text-[9px] font-semibold bg-amber-500/10 text-amber-600 px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0 animate-pulse">
                          Quá hạn
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold bg-primary/10 text-primary px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0">
                          Đang chờ
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant/85 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-on-surface-variant/60 font-semibold pt-1">
                      <Calendar size={11} />
                      {targetDate.toLocaleString('vi-VN')}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn hủy lịch thông báo này?')) {
                        deleteScheduled(item.id)
                      }
                    }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-error hover:bg-error/10 active:scale-90 transition-all shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationSettingsPage
