import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useAuthStore } from '@/store/useAuthStore'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const navLinksDesktop = [
  { name: 'Home', path: '/', icon: 'home' },
  { name: 'Stats', path: '/stats', icon: 'insights' },
  { name: 'Wallet', path: '/wallet', icon: 'account_balance_wallet' },
  { name: 'Settings', path: '/settings', icon: 'settings' }
]

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const isActive = (path: string) => location.pathname === path

  const avatarUrl = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || user?.email || 'User')}&background=005da7&color=fff`
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="flex h-screen bg-surface font-body text-on-surface selection:bg-primary/10 overflow-hidden">
      
      {/* 🚀 DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-72 flex-col border-r border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-xl z-10 transition-all">
        <div className="p-8 flex items-center gap-3 mt-2">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex flex-shrink-0 items-center justify-center overflow-hidden border border-outline-variant/20 shadow-sm">
             <img alt="User avatar" className="w-full h-full object-cover" src={avatarUrl} />
          </div>
          <h1 className="text-2xl font-headline font-extrabold tracking-tight text-primary italic">PocketFlow</h1>
        </div>
        
        <nav className="flex-1 space-y-2 px-6 pt-4">
          {navLinksDesktop.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-4 rounded-2xl px-5 py-3.5 text-sm font-bold transition-all duration-300",
                isActive(link.path) 
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <span className="material-symbols-outlined text-[24px]">{link.icon}</span>
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="p-6 space-y-4">
            <Link to="/add" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary-container text-on-secondary-container px-4 py-3.5 text-sm font-bold hover:bg-secondary-container/80 transition-colors shadow-sm">
               <span className="material-symbols-outlined text-[20px]">add</span>
               New Transaction
            </Link>
            <button
               onClick={logout}
               className="flex w-full items-center gap-4 rounded-2xl px-5 py-3.5 text-sm font-bold text-error hover:bg-error-container transition-colors"
            >
               <span className="material-symbols-outlined text-[24px]">logout</span>
               Sign Out
            </button>
        </div>
      </aside>

      {/* 📱 MAIN CONTENT WRAPPER */}
      <div className="flex flex-1 flex-col overflow-hidden relative bg-surface">
        
        {/* Mobile Top Header */}
        <header className="flex h-16 items-center justify-between px-6 bg-[#f7f9ff]/90 dark:bg-slate-950/90 backdrop-blur-md md:hidden sticky top-0 z-30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex flex-shrink-0 items-center justify-center overflow-hidden border border-outline-variant/10 shadow-sm" onClick={() => setIsSidebarOpen(true)}>
              <img alt="User" className="w-full h-full object-cover" src={avatarUrl}/>
            </div>
            <span className="font-headline font-bold text-xl tracking-tight text-primary italic">PocketFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
              <span className="material-symbols-outlined text-primary">notifications</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth p-6 md:p-8 pt-4 md:pt-10 pb-36 md:pb-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>

        {/* 📱 MOBILE BOTTOM NAV */}
        <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#f7f9ff]/85 dark:bg-slate-950/85 backdrop-blur-xl rounded-t-[24px] shadow-[0_-4px_24px_rgba(9,29,46,0.06)] md:hidden border-t border-white/20">
          <Link to="/" className={cn("flex flex-col items-center justify-center rounded-2xl p-2 min-w-[64px] active:scale-90 transition-all duration-150", isActive('/') ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:text-primary")}>
             <span className="material-symbols-outlined text-[24px]">home</span>
             <span className="font-label font-medium text-[10px] uppercase tracking-wider mt-1">Home</span>
          </Link>
          <Link to="/stats" className={cn("flex flex-col items-center justify-center p-2 min-w-[64px] active:scale-90 transition-all duration-150", isActive('/stats') ? "bg-primary text-on-primary shadow-md rounded-2xl" : "text-on-surface-variant hover:text-primary")}>
             <span className="material-symbols-outlined text-[24px]">insights</span>
             <span className="font-label font-medium text-[10px] uppercase tracking-wider mt-1">Stats</span>
          </Link>
          <Link to="/wallet" className={cn("flex flex-col items-center justify-center rounded-2xl p-2 min-w-[64px] active:scale-90 transition-all duration-150", isActive('/wallet') ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:text-primary")}>
             <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
             <span className="font-label font-medium text-[10px] uppercase tracking-wider mt-1">Wallet</span>
          </Link>
          <Link to="/settings" className={cn("flex flex-col items-center justify-center rounded-2xl p-2 min-w-[64px] active:scale-90 transition-all duration-150", isActive('/settings') ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:text-primary")}>
             <span className="material-symbols-outlined text-[24px]">settings</span>
             <span className="font-label font-medium text-[10px] uppercase tracking-wider mt-1">Settings</span>
          </Link>
        </nav>

        {/* 📱 MOBILE SIDEBAR */}
        {isSidebarOpen && (
           <div className="fixed inset-0 z-[100] flex md:hidden">
              <div className="fixed inset-0 bg-on-background/40 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
              <aside className="relative flex w-80 flex-col bg-surface p-8 shadow-2xl animate-in slide-in-from-left duration-300">
                 <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute right-6 top-6 rounded-full p-2 bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                 >
                    <span className="material-symbols-outlined">close</span>
                 </button>
                 <div className="mb-10 mt-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center overflow-hidden border border-outline-variant/20 shadow-lg">
                      <img alt="User" className="w-full h-full object-cover" src={avatarUrl}/>
                    </div>
                    <div>
                      <h3 className="font-headline font-black text-xl tracking-tight text-on-surface">{displayName}</h3>
                      <p className="font-label text-xs font-bold text-on-surface-variant opacity-60 truncate w-40">{user?.email}</p>
                    </div>
                 </div>
                 
                 <div className="flex-1 space-y-4">
                    {navLinksDesktop.map((link) => (
                      <Link 
                        key={link.path}
                        to={link.path} 
                        onClick={() => setIsSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-5 p-4 rounded-2xl text-lg font-headline font-black transition-all",
                          isActive(link.path) ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container"
                        )}
                      >
                         <span className="material-symbols-outlined text-2xl">{link.icon}</span>
                         {link.name}
                      </Link>
                    ))}
                 </div>

                 <button
                    onClick={() => { setIsSidebarOpen(false); logout(); }}
                    className="mt-auto flex items-center justify-center gap-3 rounded-2xl border-2 border-error/10 bg-error/5 p-5 text-lg font-headline font-black text-error hover:bg-error hover:text-white transition-all active:scale-95 shadow-xl shadow-error/10"
                 >
                    <span className="material-symbols-outlined">logout</span>
                    Sign Out
                 </button>
              </aside>
           </div>
        )}
      </div>
    </div>
  )
}

export default MainLayout
