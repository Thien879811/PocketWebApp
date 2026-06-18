import toast from 'react-hot-toast'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

/**
 * notify — Centralised toast notifications for PocketWebApp
 *
 * Wraps react-hot-toast with a consistent, on-brand design
 * that matches the app's glass + dark-mode design tokens.
 *
 * Usage:
 *   notify.success('Tạo giao dịch thành công')
 *   notify.error('Không thể xóa giao dịch')
 *   notify.promise(createTx(), { loading: 'Đang lưu...', success: 'Thành công!', error: 'Thất bại' })
 */

// ─── Shared tailwind classes ─────────────────────────────
const BASE =
  'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-elevated ' +
  'border backdrop-blur-xl text-sm font-medium ' +
  'dark:shadow-none'

const TOAST_ENTER = 'animate-[slideUp_0.22s_ease-out]'

// Inline keyframes injected once
const KEYFRAMES_ID = '__notify_keyframes__'
function ensureKeyframes() {
  if (typeof document === 'undefined') return
  if (document.getElementById(KEYFRAMES_ID)) return
  const style = document.createElement('style')
  style.id = KEYFRAMES_ID
  style.textContent = `
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0)    scale(1);    }
    }
  `
  document.head.appendChild(style)
}
ensureKeyframes()

// ─── Variant styles ──────────────────────────────────────
const VARIANTS = {
  success: {
    container: `${BASE} bg-secondary-container/80 dark:bg-secondary-container border-secondary/30 dark:border-secondary/20 text-secondary dark:text-secondary-container`,
    icon: CheckCircle,
  },
  error: {
    container: `${BASE} bg-error-container/80 dark:bg-error-container border-error/30 dark:border-error/20 text-error dark:text-error-container`,
    icon: XCircle,
  },
  warning: {
    container: `${BASE} bg-[#fef3c7]/80 dark:bg-[#78350f]/80 border-[#f59e0b]/30 text-[#92400e] dark:text-[#fde68a]`,
    icon: AlertTriangle,
  },
  info: {
    container: `${BASE} bg-primary-container/80 dark:bg-primary-container border-primary/30 dark:border-primary/20 text-primary dark:text-primary-container`,
    icon: Info,
  },
} as const

// ─── Custom toast renderer ───────────────────────────────
function renderToast(
  variant: 'success' | 'error' | 'warning' | 'info',
  message: string,
  t: any,
) {
  const { container, icon: Icon } = VARIANTS[variant]
  return (
    <div className={`${container} ${t.visible ? TOAST_ENTER : 'opacity-0 translate-y-2 scale-96'} max-w-sm w-full`}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="flex-1 leading-snug">{message}</span>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="ml-2 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  )
}

// ─── Public API ──────────────────────────────────────────
export const notify = {
  /** Success toast — green, auto-dismiss 3.5 s */
  success(message: string, opts?: { duration?: number }) {
    return toast.custom(
      (t) => renderToast('success', message, t),
      { duration: opts?.duration ?? 3500, position: 'top-center' },
    )
  },

  /** Error toast — red, auto-dismiss 5 s */
  error(message: string, opts?: { duration?: number }) {
    return toast.custom(
      (t) => renderToast('error', message, t),
      { duration: opts?.duration ?? 5000, position: 'top-center' },
    )
  },

  /** Warning toast — amber */
  warning(message: string) {
    return toast.custom(
      (t) => renderToast('warning', message, t),
      { duration: 4000, position: 'top-center' },
    )
  },

  /** Info toast — primary blue */
  info(message: string) {
    return toast.custom(
      (t) => renderToast('info', message, t),
      { duration: 3500, position: 'top-center' },
    )
  },

  /**
   * Promise toast — shows loading → success/error automatically.
   * Perfect for async mutations.
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
  ) {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: (data) => typeof messages.success === 'function' ? messages.success(data) : messages.success,
        error:   (err)  => typeof messages.error === 'function'   ? messages.error(err)   : messages.error,
      },
      {
        position: 'top-center',
        success:  { duration: 3500 },
        error:    { duration: 5000 },
      },
    )
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
