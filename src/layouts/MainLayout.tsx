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
  const logout = useAuthStore((state) => state.logout)

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex h-screen bg-surface font-body text-on-surface selection:bg-primary/10 overflow-hidden">
      
      {/* 🚀 DESKTOP SIDEBAR (Visible on md and up) */}
      <aside className="hidden md:flex w-72 flex-col border-r border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-xl z-10 transition-all">
        <div className="p-8 flex items-center gap-3 mt-2">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex flex-shrink-0 items-center justify-center overflow-hidden border border-outline-variant/20 shadow-sm">
             <img alt="User avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3qbMdqwOz9RwAVZKAj5V3PZM3Yi44RlwEHAcK25w3GFeF1kTO85VzraKRiIYmHVXBfHomskoE-fg-fYx4wUdCM-TifDzrufWanLW2CdEpAmZWDpofsK-j_Je9fd1g19WKbQZ4BJ_4SFF9LUTFohrO7n4khmFzITttbHzjJhbIhBgZZu9sbn-ZFap_YVp0BrFRlM9R8CkhhbWyImttUqkX36UEvhG_eITgtR74AMbTWt8w62gp3696GBylkmV-7o6jfMNmdklKJnk" />
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
        
        {/* Mobile Top Header (Sticky) */}
        <header className="flex h-16 items-center justify-between px-6 bg-[#f7f9ff]/90 dark:bg-slate-950/90 backdrop-blur-md md:hidden sticky top-0 z-30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex flex-shrink-0 items-center justify-center overflow-hidden border border-outline-variant/10 shadow-sm" onClick={() => setIsSidebarOpen(true)}>
              <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3qbMdqwOz9RwAVZKAj5V3PZM3Yi44RlwEHAcK25w3GFeF1kTO85VzraKRiIYmHVXBfHomskoE-fg-fYx4wUdCM-TifDzrufWanLW2CdEpAmZWDpofsK-j_Je9fd1g19WKbQZ4BJ_4SFF9LUTFohrO7n4khmFzITttbHzjJhbIhBgZZu9sbn-ZFap_YVp0BrFRlM9R8CkhhbWyImttUqkX36UEvhG_eITgtR74AMbTWt8w62gp3696GBylkmV-7o6jfMNmdklKJnk"/>
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
          <Link to="/add" className="flex flex-col items-center justify-center p-2 text-on-surface-variant hover:text-primary active:scale-90 transition-all duration-150 min-w-[64px]">
             <span className="material-symbols-outlined text-[24px]">add_circle</span>
             <span className="font-label font-medium text-[10px] uppercase tracking-wider mt-1">Add</span>
          </Link>
          <Link to="/settings" className={cn("flex flex-col items-center justify-center rounded-2xl p-2 min-w-[64px] active:scale-90 transition-all duration-150", isActive('/settings') ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:text-primary")}>
             <span className="material-symbols-outlined text-[24px]">settings</span>
             <span className="font-label font-medium text-[10px] uppercase tracking-wider mt-1">Settings</span>
          </Link>
        </nav>

        {/* 📱 MOBILE MODAL/DRAWER (For Avatar Menu if needed) */}
        {isSidebarOpen && (
           <div className="fixed inset-0 z-50 flex md:hidden">
              <div className="fixed inset-0 bg-on-background/40 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
              <aside className="relative flex w-80 flex-col bg-surface-container-lowest p-8 shadow-2xl transition-transform ease-out duration-300">
                 <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute right-6 top-6 rounded-full p-2 bg-surface-container-high text-on-surface-variant"
                 >
                    <span className="material-symbols-outlined">close</span>
                 </button>
                 <div className="mb-8 mt-4 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden border border-outline-variant/20 shadow-sm">
                      <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3qbMdqwOz9RwAVZKAj5V3PZM3Yi44RlwEHAcK25w3GFeF1kTO85VzraKRiIYmHVXBfHomskoE-fg-fYx4wUdCM-TifDzrufWanLW2CdEpAmZWDpofsK-j_Je9fd1g19WKbQZ4BJ_4SFF9LUTFohrO7n4khmFzITttbHzjJhbIhBgZZu9sbn-ZFap_YVp0BrFRlM9R8CkhhbWyImttUqkX36UEvhG_eITgtR74AMbTWt8w62gp3696GBylkmV-7o6jfMNmdklKJnk"/>
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-lg">Alex Manager</h3>
                      <p className="font-label text-xs text-on-surface-variant">name@atelier.com</p>
                    </div>
                 </div>
                 <button
                    onClick={() => { setIsSidebarOpen(false); logout(); }}
                    className="mt-auto flex items-center justify-center gap-2 rounded-2xl border border-error/20 px-5 py-4 text-sm font-bold text-error hover:bg-error-container/30 transition-colors"
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
