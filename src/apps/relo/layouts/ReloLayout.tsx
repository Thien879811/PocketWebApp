import React from 'react'
import { Heart, Users, Calendar, Gift, Settings } from 'lucide-react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/relo', icon: Heart, label: 'Trang chủ', exact: true },
  { path: '/relo/contacts', icon: Users, label: 'Người thân', exact: false },
  { path: '/relo/appointments', icon: Calendar, label: 'Lịch hẹn', exact: false },
  { path: '/relo/preferences', icon: Gift, label: 'Sở thích', exact: false },
  { path: '/relo/settings', icon: Settings, label: 'Cài đặt', exact: false },
]

// Các path không hiển thị bottom nav (form pages)
const hideNavPaths = [
  '/relo/anniversaries/create',
  '/relo/anniversaries/edit/',
  '/relo/events/create',
  '/relo/events/edit/',
  '/relo/preferences/create',
  '/relo/preferences/edit/',
]

const ReloLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const showNav = !hideNavPaths.some((p) => location.pathname.startsWith(p))

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path) && item.path !== '/relo'
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-['Inter'] selection:bg-primary/20 transition-colors duration-300">

      {/* ── Sticky glassmorphism header ── */}
      <header className="sticky top-0 z-50 bg-surface/75 dark:bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/25 dark:border-outline-variant/15 px-4 py-3 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-2">
          <Heart size={18} className="text-primary fill-primary/20" />
          <span className="text-lg font-bold italic tracking-tight text-primary dark:glow">
            Relo
          </span>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className={`max-w-lg mx-auto md:max-w-xl ${showNav ? 'pb-24' : 'pb-8'}`}>
        <Outlet />
      </main>

      {/* ── Bottom nav (ẩn trên form pages) ── */}
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/85 dark:bg-surface-container-lowest/90 backdrop-blur-xl border-t border-outline-variant/25 dark:border-outline-variant/15 pb-safe transition-colors duration-300">
          <div className="flex items-end justify-around px-2 pt-2 pb-3 max-w-lg mx-auto">
            {navItems.map((item) => {
              const active = isActive(item)
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-1 min-w-[56px] group !bg-transparent !border-0"
                >
                  <div className={`px-4 py-1.5 rounded-full transition-all duration-200 ${active ? 'bg-primary-container dark:bg-primary/20' : 'group-hover:bg-surface-container-high dark:group-hover:bg-surface-container'}`}>
                    <item.icon
                      size={22}
                      className={`transition-colors ${active ? 'text-primary fill-primary/20' : 'text-on-surface-variant group-hover:text-primary'}`}
                      strokeWidth={active ? 2.5 : 1.75}
                    />
                  </div>
                  <span className={`text-[10px] font-medium tracking-wide transition-colors ${active ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}

export default ReloLayout
