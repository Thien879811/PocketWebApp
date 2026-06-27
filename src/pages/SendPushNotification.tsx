import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Sparkles, AlertCircle, CheckCircle, Smartphone } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { supabase } from '@/utils/supabase'
import toast from 'react-hot-toast'

const SendPushNotification: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [targetUserId, setTargetUserId] = useState(user?.id || '')
  const [title, setTitle] = useState('PocketFlow FCM Test')
  const [message, setMessage] = useState('Đây là thông báo đẩy thử nghiệm từ Firebase!')
  const [link, setLink] = useState('/')
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; text: string } | null>(null)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetUserId.trim()) {
      toast.error('Vui lòng nhập User ID đích')
      return
    }

    setIsSending(true)
    setResult(null)

    try {
      // Insert into the notifications table which triggers the Edge Function Webhook
      const { error } = await supabase.from('notifications').insert({
        user_id: targetUserId.trim(),
        title: title.trim(),
        message: message.trim(),
        link: link.trim(),
      })

      if (error) {
        throw error
      }

      setResult({
        success: true,
        text: 'Đã tạo bản ghi thông báo trong Database! Trigger sẽ gửi yêu cầu FCM đến thiết bị tương ứng.',
      })
      toast.success('Gửi thông báo thành công!')
    } catch (err: any) {
      console.error('Failed to send push notification:', err)
      setResult({
        success: false,
        text: err.message || 'Lỗi không xác định khi lưu thông báo.',
      })
      toast.error('Gửi thông báo thất bại.')
    } finally {
      setIsSending(false)
    }
  }

  const useSelf = () => {
    if (user?.id) {
      setTargetUserId(user.id)
      toast.success('Đã chọn bản thân làm người nhận!')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      {/* ── Page Header ─────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-xl bg-surface-container/60 hover:bg-surface-container/90 flex items-center justify-center text-on-surface border border-outline-variant/10 active:scale-95 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
            Gửi thông báo đẩy Firebase (FCM)
          </h1>
          <p className="text-sm text-on-surface-variant/60">
            Gửi thử nghiệm thông báo đẩy tới thiết bị của người dùng qua Firebase Cloud Messaging.
          </p>
        </div>
      </div>

      {/* ── Workflow Diagram / Help Card ───────────── */}
      <div className="bg-gradient-to-br from-violet-500/10 to-primary/10 rounded-2xl border border-violet-500/20 p-5 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-2 text-violet-500 font-semibold text-sm">
          <Sparkles size={16} />
          <span>Quy trình hoạt động</span>
        </div>
        <p className="text-xs text-on-surface-variant/80 leading-relaxed">
          Khi bấm <strong>Gửi thông báo</strong>, hệ thống sẽ chèn dữ liệu vào bảng <code>notifications</code> của <strong>Supabase Database</strong>. 
          Một Database Webhook tự động kích hoạt <strong>Supabase Edge Function (send-fcm)</strong>, chức năng này sẽ lấy 
          FCM Registration Token tương ứng với User ID và gửi bản tin qua <strong>Firebase Cloud Messaging API v1</strong> tới thiết bị/trình duyệt của người dùng.
        </p>
      </div>

      {/* ── Form Card ──────────────────────────────── */}
      <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-6 shadow-xl relative">
        <form onSubmit={handleSend} className="space-y-5">
          {/* User ID */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-outline">
                User ID Đích (Người Nhận)
              </label>
              <button
                type="button"
                onClick={useSelf}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Gửi cho chính tôi
              </button>
            </div>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined transition-colors group-focus-within:text-primary">
                person
              </span>
              <input
                type="text"
                required
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="User UUID từ Supabase Auth..."
                className="w-full h-12 pl-12 pr-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline/50 font-medium text-sm transition-all"
              />
            </div>
            <p className="text-[10px] text-on-surface-variant/40 pl-1">
              UUID này dùng để tìm các thiết bị đã đăng ký token FCM trong bảng <code>fcm_tokens</code>.
            </p>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-outline">
              Tiêu đề thông báo
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined transition-colors group-focus-within:text-primary">
                title
              </span>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề thông báo..."
                className="w-full h-12 pl-12 pr-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline/50 font-medium text-sm transition-all"
              />
            </div>
          </div>

          {/* Message Body */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-outline">
              Nội dung thông báo
            </label>
            <div className="relative group">
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập nội dung tin nhắn gửi tới thiết bị..."
                className="w-full p-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline/50 font-medium text-sm transition-all resize-none"
              />
            </div>
          </div>

          {/* Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-outline">
              Đường dẫn điều hướng (Link)
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined transition-colors group-focus-within:text-primary">
                link
              </span>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Nhập đường dẫn khi click thông báo (ví dụ: /settings/notifications)"
                className="w-full h-12 pl-12 pr-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline/50 font-medium text-sm transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSending}
              className="w-full h-12 bg-primary text-white font-headline font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Gửi thông báo</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* ── Status Result Indicator ───────────────── */}
        {result && (
          <div
            className={`mt-6 p-4 rounded-2xl border flex gap-3 items-start animate-in fade-in duration-300 ${
              result.success
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 border-red-500/25 text-red-500 dark:text-red-400'
            }`}
          >
            {result.success ? (
              <CheckCircle size={18} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
            )}
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider">
                {result.success ? 'Thành công' : 'Thất bại'}
              </p>
              <p className="text-xs leading-relaxed font-medium">{result.text}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Device Registration Checklist / Info ─── */}
      <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 p-5 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">
          <Smartphone size={14} />
          <span>Kiểm tra thiết bị</span>
        </div>
        <ul className="text-xs text-on-surface-variant/70 space-y-1.5 list-disc list-inside leading-relaxed">
          <li>Thiết bị của bạn phải được đăng ký token Firebase. Hãy đảm bảo bạn đã nhấn đồng ý cho phép thông báo khi vào ứng dụng.</li>
          <li>Bạn có thể kiểm tra xem token đã tồn tại hay chưa trong Database ở bảng <code>fcm_tokens</code> ứng với ID của bạn.</li>
          <li>Để thử nghiệm thông báo đẩy nền (Background Push), hãy chuyển trình duyệt của bạn sang tab khác hoặc thu nhỏ trình duyệt xuống Taskbar trước khi nhận thông báo.</li>
        </ul>
      </div>
    </div>
  )
}

export default SendPushNotification
