import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useAuthStore } from '@/store/useAuthStore'
import {
  Plus, X, LogOut,
} from 'lucide-react'
import {
  pageVariants,
  fadeVariants,
  drawerLeftVariants,
  dotVariants,
  EASE_OUT,
  DURATION,
} from '@/lib/motion'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const NAV_LINKS = [
  { name: 'Trang chủ', path: '/',         materialIcon: 'home' },
  { name: 'Sổ sách',   path: '/ledger',   materialIcon: 'receipt_long' },
  { name: 'Thống kê',  path: '/stats',    materialIcon: 'insights' },
  { name: 'Ví tiền',   path: '/wallet',   materialIcon: 'account_balance_wallet' },
  { name: 'Cài đặt',   path: '/settings', materialIcon: 'settings' },
]

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  const user      = useAuthStore((s) => s.user)
  const logout    = useAuthStore((s) => s.logout)

  const isActive = (path: string) => location.pathname === path

  const avatarUrl = user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.user_metadata?.full_name || user?.email || 'U'
    )}&background=4f6ef7&color=fff&bold=true&size=128`

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="flex h-screen bg-surface font-body text-on-surface overflow-hidden">

      {/* ─── DESKTOP SIDEBAR ─────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 flex-col border-r border-outline-variant/20 bg-surface-container-lowest z-10">

        {/* Brand */}
        <div className="px-6 py-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-primary/30">
            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
          </div>
          <span className="text-lg font-headline font-extrabold tracking-tight text-on-surface">
            PocketFlow
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 pt-2">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.path)
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                  active
                    ? "bg-primary text-white shadow-sm shadow-primary/30"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                )}
              >
                <span
                  className="material-symbols-outlined text-[20px] flex-shrink-0"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {link.materialIcon}
                </span>
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 space-y-2">
          <Link
            to="/add"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary px-4 py-3 text-sm font-bold hover:bg-primary hover:text-white transition-all duration-200"
          >
            <Plus size={18} strokeWidth={2.5} />
            Giao dịch mới
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-on-surface-variant hover:bg-error/8 hover:text-error transition-all duration-200"
          >
            <LogOut size={16} strokeWidth={2} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Mobile Header */}
        <header className="md:hidden flex h-14 items-center justify-between px-4 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/15 sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-container transition-colors active:scale-95"
          >
            <img
              src={avatarUrl}
              alt="User"
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-primary/20"
            />
          </button>

          <span className="font-headline font-bold text-base tracking-tight text-on-surface">
            PocketFlow
          </span>

          <Link
            to="/add"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/40 active:scale-95 transition-transform"
          >
            <Plus size={18} strokeWidth={2.5} />
          </Link>
        </header>

        {/* Scrollable Content — AnimatePresence drives page transitions */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth pb-24 md:pb-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mx-auto max-w-5xl px-4 md:px-8 pt-4 md:pt-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ─── MOBILE BOTTOM NAV ─────────────────────────────────── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/15 pb-safe">
          <div className="flex items-center justify-around px-2 pt-2 pb-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-colors duration-200 min-w-[56px]",
                    active ? "text-primary" : "text-on-surface-variant"
                  )}
                >
                  {/* Icon with animated scale + active dot */}
                  <motion.div
                    className="relative"
                    animate={{ scale: active ? 1.12 : 1 }}
                    transition={{ duration: DURATION.normal, ease: EASE_OUT }}
                  >
                    <span
                      className="material-symbols-outlined text-[24px]"
                      style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {link.materialIcon}
                    </span>

                    {/* Active indicator dot — fades/scales in/out */}
                    <AnimatePresence>
                      {active && (
                        <motion.span
                          variants={dotVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <span className={cn(
                    "text-[10px] font-medium tracking-tight leading-none",
                    active ? "text-primary font-semibold" : "text-on-surface-variant/70"
                  )}>
                    {link.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* ─── MOBILE DRAWER ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[100] flex md:hidden">

            {/* Backdrop */}
            <motion.div
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.aside
              variants={drawerLeftVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative w-72 flex flex-col bg-surface-container-lowest h-full shadow-2xl z-10"
            >
              {/* User info */}
              <div className="p-6 pt-14 flex items-center gap-4 border-b border-outline-variant/15">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary/20"
                />
                <div className="min-w-0">
                  <p className="font-headline font-bold text-base text-on-surface truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors"
                >
                  <X size={16} className="text-on-surface-variant" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {NAV_LINKS.map((link) => {
                  const active = isActive(link.path)
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3.5 font-semibold text-sm transition-all duration-200",
                        active
                          ? "bg-primary text-white shadow-sm shadow-primary/30"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      )}
                    >
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {link.materialIcon}
                      </span>
                      {link.name}
                    </Link>
                  )
                })}
              </nav>

              {/* Sign out */}
              <div className="p-4 border-t border-outline-variant/15">
                <button
                  onClick={() => { setIsSidebarOpen(false); logout() }}
                  className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-error hover:bg-error/8 transition-colors"
                >
                  <LogOut size={18} strokeWidth={2} />
                  Đăng xuất
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainLayout
