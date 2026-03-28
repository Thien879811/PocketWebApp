import React, { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useRegister } from '@/features/auth/hooks/useRegister'
import { Loader2 } from 'lucide-react'

const Register: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [showPassword, setShowPassword] = useState(false)
  const { form, onSubmit, isLoading, error } = useRegister()
  
  const { register, handleSubmit, formState: { errors } } = form

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="bg-surface font-body text-on-surface flex min-h-screen items-center justify-center p-0 md:p-4 overflow-hidden relative">
      
      {/* 🔮 Decorative Glass Background Elements (Visible on Desktop) */}
      <div className="hidden md:block absolute -top-20 -left-20 w-96 h-96 bg-primary-container/20 rounded-full blur-[100px] pointer-events-none animation-pulse-slow"></div>
      <div className="hidden md:block absolute bottom-20 -right-20 w-80 h-80 bg-tertiary-container/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* 📱 Main Register Container (iPhone 14 Pro Layout Simulation on Mobile, Card on Desktop) */}
      <div className="relative w-full max-w-[393px] md:h-[852px] h-screen md:bg-white md:rounded-[55px] md:shadow-[0_0_0_12px_#1a1a1a,0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col bg-surface">
        
        {/* 🏝️ Custom Status Bar / Top Area (Mobile only) */}
        <div className="md:flex hidden absolute top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full z-50"></div>
        <div className="h-11 w-full flex items-center justify-between px-8 pt-4 md:flex hidden opacity-60">
           <span className="text-sm font-semibold">9:41</span>
           <div className="flex gap-1.5 items-center">
             <span className="material-symbols-outlined text-[18px]">signal_cellular_4_bar</span>
             <span className="material-symbols-outlined text-[18px]">wifi</span>
             <span className="material-symbols-outlined text-[20px]">battery_full</span>
           </div>
        </div>

        {/* 🎨 Main Canvas */}
        <main className="flex-1 overflow-y-auto px-8 pt-10 pb-10 flex flex-col">
          
          {/* 💎 Branding Section */}
          <div className="mb-8">
            <h1 className="font-headline font-extrabold text-[34px] leading-tight text-on-surface tracking-tight">
                Create Account
            </h1>
            <p className="font-body text-on-surface-variant mt-2 text-base leading-relaxed opacity-80">
                Start your journey with PocketFlow today.
            </p>
          </div>

          {/* 📝 Form Area */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col space-y-5">
            <div className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="font-label text-[10px] font-bold uppercase tracking-[0.15em] text-outline ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline transition-colors group-focus-within:text-primary">
                    person
                  </span>
                  <input 
                    {...register('fullName')}
                    type="text"
                    className={`w-full h-14 pl-12 pr-4 bg-surface-container-high rounded-2xl border-none focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline/50 font-medium transition-all ${
                      errors.fullName ? 'ring-2 ring-error' : ''
                    }`}
                    placeholder="Alex Manager"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs font-semibold text-error ml-1">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="font-label text-[10px] font-bold uppercase tracking-[0.15em] text-outline ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline transition-colors group-focus-within:text-primary">
                    mail
                  </span>
                  <input 
                    {...register('email')}
                    type="email"
                    className={`w-full h-14 pl-12 pr-4 bg-surface-container-high rounded-2xl border-none focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline/50 font-medium transition-all ${
                      errors.email ? 'ring-2 ring-error' : ''
                    }`}
                    placeholder="name@atelier.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-semibold text-error ml-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-end px-1">
                  <label className="font-label text-[10px] font-bold uppercase tracking-[0.15em] text-outline">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline transition-colors group-focus-within:text-primary">
                    lock
                  </span>
                  <input 
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full h-14 pl-12 pr-12 bg-surface-container-high rounded-2xl border-none focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline/50 font-medium transition-all ${
                      errors.password ? 'ring-2 ring-error' : ''
                    }`}
                    placeholder="Min 6 characters"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline hover:text-on-surface transition-colors"
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs font-semibold text-error ml-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* 🛑 Generic Error Display */}
            {error && (
              <div className="bg-error-container text-on-error-container text-sm p-3 rounded-2xl border border-error/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span className="font-medium font-body">{error.message}</span>
              </div>
            )}

            {/* 🚀 CONTINUE ACTION */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-14 mt-4 bg-primary text-white font-headline font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all hover:bg-primary/90 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign Up'}
            </button>

            {/* ⚖️ Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-outline font-bold">OR</span>
              <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
            </div>

            {/* 🌐 Social Logins */}
            <div className="space-y-3">
              <button type="button" className="w-full h-14 bg-white border border-outline-variant/40 flex items-center justify-center gap-3 rounded-2xl hover:bg-surface-container-low transition-colors active:scale-[0.98] font-semibold text-on-surface">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Sign up with Google
              </button>
            </div>
          </form>

          {/* 🏁 Footer Section */}
          <div className="mt-8 flex justify-center items-center gap-2">
            <span className="font-body text-outline text-sm font-medium">Already have an account?</span>
            <Link to="/login" className="font-body font-bold text-primary text-sm hover:underline cursor-pointer">
              Sign In
            </Link>
          </div>
        </main>

        {/* 📱 Home Indicator (Mobile effect) */}
        <div className="h-8 w-full flex justify-center items-end pb-2 md:opacity-0 opacity-100">
           <div className="w-32 h-1.5 bg-on-surface rounded-full opacity-10"></div>
        </div>
      </div>
    </div>
  )
}

export default Register
