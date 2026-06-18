import toast from 'react-hot-toast'
import { CheckCircle, XCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-react'

/**
 * notify — Centralised toast notifications for PocketWebApp
 *
 * Uses inline styles (not Tailwind) so content is always visible
 * regardless of build-time CSS purging.
 *
 * Usage:
 *   notify.success('Tạo giao dịch thành công')
 *   notify.error('Không thể xóa giao dịch')
 *   notify.promise(createTx(), { loading: 'Đang lưu...', success: 'Thành công!', error: 'Thất bại' })
 */

// ─── Inject keyframes once ────────────────────────────────
const STYLE_ID = '__notify_styles__'
function ensureStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    @keyframes notifyIn {
      0%   { opacity: 0; transform: translateY(-16px) scale(0.94); }
      60%  { opacity: 1; transform: translateY(2px)  scale(1.01); }
      100% { opacity: 1; transform: translateY(0)    scale(1);    }
    }
    @keyframes notifyOut {
      0%   { opacity: 1; transform: translateY(0)  scale(1);    }
      100% { opacity: 0; transform: translateY(-8px) scale(0.96); }
    }
    @keyframes notifyProgress {
      from { width: 100%; }
      to   { width: 0%;   }
    }
    .notify-toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px 14px 16px;
      border-radius: 16px;
      min-width: 280px;
      max-width: 380px;
      width: 100%;
      position: relative;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.5;
      box-sizing: border-box;
    }
    .notify-toast--visible {
      animation: notifyIn 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    .notify-toast--hidden {
      animation: notifyOut 0.2s ease-in forwards;
    }
    .notify-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      border-radius: 0 0 16px 16px;
    }
    .notify-close {
      flex-shrink: 0;
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.6;
      transition: opacity 0.15s, background 0.15s;
      color: inherit;
      margin-top: 1px;
    }
    .notify-close:hover {
      opacity: 1;
      background: rgba(0,0,0,0.08);
    }
    .notify-icon {
      flex-shrink: 0;
      margin-top: 1px;
    }
    .notify-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .notify-title {
      font-weight: 600;
      font-size: 13px;
      letter-spacing: 0.01em;
    }
    .notify-message {
      font-weight: 400;
      font-size: 13px;
      opacity: 0.85;
    }
  `
  document.head.appendChild(style)
}
ensureStyles()

// ─── Variant configs ──────────────────────────────────────
type Variant = 'success' | 'error' | 'warning' | 'info' | 'loading'

const VARIANTS: Record<Variant, {
  background: string
  border: string
  color: string
  progressColor: string
  icon: React.FC<{ size?: number; strokeWidth?: number }>
  title: string
}> = {
  success: {
    background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.08) 100%)',
    border: '1px solid rgba(16,185,129,0.35)',
    color: '#065f46',
    progressColor: '#10b981',
    icon: ({ size = 20 }) => <CheckCircle size={size} strokeWidth={2} color="#10b981" />,
    title: 'Thành công',
  },
  error: {
    background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(220,38,38,0.08) 100%)',
    border: '1px solid rgba(239,68,68,0.35)',
    color: '#7f1d1d',
    progressColor: '#ef4444',
    icon: ({ size = 20 }) => <XCircle size={size} strokeWidth={2} color="#ef4444" />,
    title: 'Lỗi',
  },
  warning: {
    background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(217,119,6,0.08) 100%)',
    border: '1px solid rgba(245,158,11,0.35)',
    color: '#78350f',
    progressColor: '#f59e0b',
    icon: ({ size = 20 }) => <AlertTriangle size={size} strokeWidth={2} color="#f59e0b" />,
    title: 'Cảnh báo',
  },
  info: {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(79,70,229,0.08) 100%)',
    border: '1px solid rgba(99,102,241,0.35)',
    color: '#312e81',
    progressColor: '#6366f1',
    icon: ({ size = 20 }) => <Info size={size} strokeWidth={2} color="#6366f1" />,
    title: 'Thông tin',
  },
  loading: {
    background: 'linear-gradient(135deg, rgba(148,163,184,0.12) 0%, rgba(100,116,139,0.08) 100%)',
    border: '1px solid rgba(148,163,184,0.35)',
    color: '#1e293b',
    progressColor: '#94a3b8',
    icon: ({ size = 20 }) => (
      <Loader2
        size={size}
        strokeWidth={2}
        color="#6366f1"
        style={{ animation: 'spin 1s linear infinite' }}
      />
    ),
    title: 'Đang xử lý',
  },
}

// Dark mode: detect via media query
function isDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getDarkOverrides(variant: Variant): Partial<typeof VARIANTS[Variant]> {
  const dark: Partial<Record<Variant, Partial<typeof VARIANTS[Variant]>>> = {
    success: { background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.14) 100%)', color: '#6ee7b7' },
    error:   { background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(220,38,38,0.14) 100%)', color: '#fca5a5' },
    warning: { background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.14) 100%)', color: '#fde68a' },
    info:    { background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(79,70,229,0.14) 100%)', color: '#c7d2fe' },
    loading: { background: 'linear-gradient(135deg, rgba(148,163,184,0.2) 0%, rgba(100,116,139,0.14) 100%)', color: '#cbd5e1' },
  }
  return dark[variant] ?? {}
}

// ─── Toast card component ─────────────────────────────────
function NotifyCard({
  t,
  variant,
  message,
  title,
  duration,
}: {
  t: any
  variant: Variant
  message: string
  title?: string
  duration?: number
}) {
  const cfg = { ...VARIANTS[variant], ...(isDark() ? getDarkOverrides(variant) : {}) }
  const IconComp = cfg.icon
  const resolvedTitle = title ?? cfg.title
  const showProgress = variant !== 'loading' && duration && duration < 30000

  return (
    <div
      className={`notify-toast ${t.visible ? 'notify-toast--visible' : 'notify-toast--hidden'}`}
      style={{
        background: cfg.background,
        border: cfg.border,
        color: cfg.color,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <span className="notify-icon">
        <IconComp size={20} />
      </span>

      {/* Body */}
      <div className="notify-body">
        <span className="notify-title" style={{ color: cfg.color }}>{resolvedTitle}</span>
        <span className="notify-message" style={{ color: cfg.color }}>{message}</span>
      </div>

      {/* Dismiss button */}
      {variant !== 'loading' && (
        <button
          className="notify-close"
          style={{ color: cfg.color }}
          onClick={() => toast.dismiss(t.id)}
          aria-label="Đóng thông báo"
        >
          <X size={15} strokeWidth={2.5} />
        </button>
      )}

      {/* Progress bar */}
      {showProgress && (
        <div
          className="notify-progress"
          style={{
            background: cfg.progressColor,
            opacity: 0.7,
            animation: `notifyProgress ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  )
}

// ─── Loading spinner keyframe ─────────────────────────────
// Inject spin for the loading icon
const SPIN_ID = '__notify_spin__'
function ensureSpin() {
  if (typeof document === 'undefined') return
  if (document.getElementById(SPIN_ID)) return
  const s = document.createElement('style')
  s.id = SPIN_ID
  s.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`
  document.head.appendChild(s)
}
ensureSpin()

// ─── Public API ──────────────────────────────────────────
export const notify = {
  /** ✅ Success toast — green, auto-dismiss 3.5s */
  success(message: string, opts?: { duration?: number; title?: string }) {
    const dur = opts?.duration ?? 3500
    return toast.custom(
      (t) => (
        <NotifyCard t={t} variant="success" message={message} title={opts?.title} duration={dur} />
      ),
      { duration: dur, position: 'top-center' },
    )
  },

  /** ❌ Error toast — red, auto-dismiss 5s */
  error(message: string, opts?: { duration?: number; title?: string }) {
    const dur = opts?.duration ?? 5000
    return toast.custom(
      (t) => (
        <NotifyCard t={t} variant="error" message={message} title={opts?.title} duration={dur} />
      ),
      { duration: dur, position: 'top-center' },
    )
  },

  /** ⚠️ Warning toast — amber */
  warning(message: string, opts?: { duration?: number; title?: string }) {
    const dur = opts?.duration ?? 4000
    return toast.custom(
      (t) => (
        <NotifyCard t={t} variant="warning" message={message} title={opts?.title} duration={dur} />
      ),
      { duration: dur, position: 'top-center' },
    )
  },

  /** ℹ️ Info toast — indigo */
  info(message: string, opts?: { duration?: number; title?: string }) {
    const dur = opts?.duration ?? 3500
    return toast.custom(
      (t) => (
        <NotifyCard t={t} variant="info" message={message} title={opts?.title} duration={dur} />
      ),
      { duration: dur, position: 'top-center' },
    )
  },

  /**
   * ⏳ Promise toast — shows loading → success/error automatically.
   *
   * @example
   * notify.promise(
   *   supabase.rpc('create_transaction', { ... }),
   *   {
   *     loading:  'Đang lưu giao dịch...',
   *     success:  'Tạo giao dịch thành công!',
   *     error:    (err) => `Lỗi: ${err.message}`,
   *   }
   * )
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((err: any) => string)
    },
    opts?: { successDuration?: number; errorDuration?: number },
  ): Promise<T> {
    const id = toast.custom(
      (t) => (
        <NotifyCard t={t} variant="loading" message={messages.loading} />
      ),
      { duration: Infinity, position: 'top-center' },
    )

    promise
      .then((data) => {
        toast.dismiss(id)
        const msg = typeof messages.success === 'function' ? messages.success(data) : messages.success
        notify.success(msg, { duration: opts?.successDuration })
      })
      .catch((err) => {
        toast.dismiss(id)
        const msg = typeof messages.error === 'function' ? messages.error(err) : messages.error
        notify.error(msg, { duration: opts?.errorDuration })
      })

    return promise
  },

  /** Dismiss a specific toast by id */
  dismiss(id: string) {
    toast.dismiss(id)
  },

  /** Dismiss all toasts */
  dismissAll() {
    toast.dismiss()
  },
}
