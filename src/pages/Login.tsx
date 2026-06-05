import React, { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { DURATION, EASE_OUT } from '@/lib/motion'

const Login: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [showPassword, setShowPassword] = useState(false)
  const { form, onSubmit, isLoading, error } = useLogin()
  const { register, handleSubmit, formState: { errors } } = form

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/8 rounded-full blur-3xl translate-y-1/2" />
      </div>

      <div className="w-full max-w-[400px] relative z-10">

        {/* Logo / Brand */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.slow, ease: EASE_OUT }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg shadow-primary/30 mb-5"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, duration: DURATION.normal, ease: EASE_OUT }}
          >
            <span
              className="material-symbols-outlined text-white text-[32px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              account_balance_wallet
            </span>
          </motion.div>
          <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight">
            PocketFlow
          </h1>
          <p className="text-sm text-on-surface-variant mt-1.5">
            Quản lý tài chính thông minh
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20 shadow-elevated"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, duration: DURATION.slow, ease: EASE_OUT }}
        >

          <h2 className="font-headline font-bold text-xl text-on-surface mb-6">
            Đăng nhập
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant/50">
                  mail
                </span>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full h-12 bg-surface-container rounded-xl pl-10 pr-4 text-sm text-on-surface font-medium border placeholder:text-on-surface-variant/40 transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30 focus:border-primary/40 ${
                    errors.email
                      ? 'border-error/50 focus:ring-error/20'
                      : 'border-outline-variant/30'
                  }`}
                />
              </div>
              {errors.email && (
                <motion.p
                  className="text-xs text-error flex items-center gap-1 mt-1"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: DURATION.fast }}
                >
                  <AlertCircle size={12} />
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Mật khẩu
                </label>
                <a href="#" className="text-xs text-primary font-medium hover:underline">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant/50">
                  lock
                </span>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full h-12 bg-surface-container rounded-xl pl-10 pr-11 text-sm text-on-surface font-medium border placeholder:text-on-surface-variant/40 transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30 focus:border-primary/40 ${
                    errors.password
                      ? 'border-error/50 focus:ring-error/20'
                      : 'border-outline-variant/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  className="text-xs text-error flex items-center gap-1 mt-1"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: DURATION.fast }}
                >
                  <AlertCircle size={12} />
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Server error */}
            {error && (
              <motion.div
                className="flex items-center gap-3 bg-error-container text-on-error-container rounded-xl p-3.5 text-sm border border-error/15"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: DURATION.fast, ease: EASE_OUT }}
              >
                <AlertCircle size={16} className="flex-shrink-0" />
                <span className="font-medium">{error.message}</span>
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.01 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              transition={{ duration: DURATION.fast, ease: EASE_OUT }}
              className="w-full h-12 bg-primary text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm shadow-primary/30 hover:brightness-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Đăng nhập'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-outline-variant/40" />
            <span className="text-[11px] text-on-surface-variant/60 uppercase tracking-wider font-medium">
              hoặc
            </span>
            <div className="h-px flex-1 bg-outline-variant/40" />
          </div>

          {/* Social */}
          <div className="space-y-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: DURATION.fast, ease: EASE_OUT }}
              className="w-full h-12 bg-surface-container rounded-xl border border-outline-variant/30 flex items-center justify-center gap-3 text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Tiếp tục với Google
            </motion.button>
          </div>
        </motion.div>

        {/* Sign up link */}
        <motion.p
          className="text-center text-sm text-on-surface-variant mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: DURATION.normal }}
        >
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </motion.p>
      </div>
    </div>
  )
}

export default Login
