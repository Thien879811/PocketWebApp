import React from 'react'
import { 
  LogOut, 
  ChevronRight, 
  Camera,
  LayoutGrid,
  History,
  Target,
  Moon,
  Sun,
  TrendingUp,
  Home,
  BookOpen,
  BarChart3,
  Wallet,
  CalendarCheck,
  ExternalLink,
  ArrowLeft,
  Heart
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useThemeStore } from '@/store/useThemeStore'

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const Settings: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const { isDarkMode, toggleTheme } = useThemeStore()

  const avatarUrl = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || user?.email || 'User')}&background=005da7&color=fff`
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  const settingsGroups = [
    {
      title: 'Liên kết nhanh',
      icon: 'explore',
      items: [
        { icon: Home, label: 'Trang chủ', path: '/', color: 'bg-blue-500/10 text-blue-500 dark:bg-blue-400/15 dark:text-blue-400', materialIcon: 'home' },
        { icon: BookOpen, label: 'Sổ giao dịch', path: '/ledger', color: 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/15 dark:text-indigo-400', materialIcon: 'receipt_long' },
        { icon: BarChart3, label: 'Thống kê', path: '/stats', color: 'bg-violet-500/10 text-violet-500 dark:bg-violet-400/15 dark:text-violet-400', materialIcon: 'insights' },
        { icon: Wallet, label: 'Ví tiền', path: '/wallet', color: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/15 dark:text-emerald-400', materialIcon: 'account_balance_wallet' },
        { icon: CalendarCheck, label: 'Kế hoạch chi tiêu', path: '/budget', color: 'bg-amber-500/10 text-amber-500 dark:bg-amber-400/15 dark:text-amber-400', materialIcon: 'savings' },
      ]
    },
    {
      title: 'Tùy chỉnh',
      icon: 'tune',
      items: [
        { icon: LayoutGrid, label: 'Danh mục chi tiêu', path: '/settings/categories', color: 'bg-primary/10 text-primary', materialIcon: 'category' },
        { icon: Target, label: 'Mục tiêu tích lũy', path: '/goals', color: 'bg-green-600/10 text-green-600', materialIcon: 'flag' },
        { icon: History, label: 'Lịch sử ngân sách', path: '/settings/budget-history', color: 'bg-secondary/10 text-secondary', materialIcon: 'history' },
        { icon: TrendingUp, label: 'Biến động số dư', path: '/settings/balance-history', color: 'bg-primary/10 text-primary', materialIcon: 'trending_up' },
        { 
          icon: isDarkMode ? Sun : Moon, 
          label: isDarkMode ? 'Chế độ sáng' : 'Chế độ tối', 
          onClick: toggleTheme, 
          color: isDarkMode ? 'bg-amber-400/10 text-amber-500' : 'bg-slate-700/10 text-slate-800 dark:text-slate-200',
          materialIcon: isDarkMode ? 'light_mode' : 'dark_mode'
        },
      ]
    },
    {
      title: 'Ứng dụng mở rộng',
      icon: 'apps',
      items: [
        { icon: Heart, label: 'Relo', path: '/relo', color: 'bg-rose-500/10 text-rose-500 dark:bg-rose-400/15 dark:text-rose-400', materialIcon: 'diversity_1' },
      ]
    }
  ]

  return (
    <div className="max-w-lg mx-auto md:max-w-none pt-4 pb-24 scrollbar-hide">
      
      {/* 🏔️ Profile Header Area */}
      <section className="mb-12 px-2">
        <h2 className="font-headline font-black text-3xl text-on-surface tracking-tight mb-10 italic dark:glow">Cài đặt</h2>
        
        <div className="bg-surface-container-lowest p-8 rounded-[3rem] border border-outline-variant/10 shadow-xl dark:shadow-dark flex flex-col items-center gap-6 relative overflow-hidden group">
           <div className="relative">
              <div className="w-28 h-28 rounded-[2.5rem] bg-surface-container-high flex items-center justify-center overflow-hidden border-4 border-surface shadow-2xl dark:shadow-dark relative z-10">
                 <img alt="Profile" className="w-full h-full object-cover dark:opacity-90" src={avatarUrl} />
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg z-20 active:scale-90 transition-transform">
                 <Camera size={18} strokeWidth={2.5} />
              </button>
           </div>
           
           <div className="text-center space-y-2 relative z-10">
              <h3 className="font-headline font-black text-2xl tracking-tight text-on-surface italic dark:glow">{displayName}</h3>
              <p className="font-label text-[10px] font-black text-on-surface-variant opacity-60 uppercase tracking-widest px-4 py-1.5 bg-surface-container-high rounded-full inline-block">{user?.email}</p>
           </div>

           {/* Decorative Background */}
           <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-all duration-1000"></div>
           <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-secondary/10 dark:bg-secondary/20 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-all duration-1000"></div>
        </div>
      </section>

      {/* 📱 Settings Groups */}
      <section className="space-y-10 px-2">
        {settingsGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-4">
            <div className="px-4 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant opacity-40">{group.icon}</span>
              <h4 className="font-label text-[10px] uppercase font-black tracking-[0.2em] text-on-surface-variant opacity-40">{group.title}</h4>
            </div>
            <div className="bg-surface-container-lowest rounded-[3rem] overflow-hidden border border-outline-variant/10 shadow-sm dark:shadow-dark">
              {group.items.map((item, iIdx) => (
                <button
                  key={iIdx}
                  onClick={() => {
                    if ((item as any).onClick) {
                      (item as any).onClick();
                    } else if ((item as any).isAbout) {
                      navigate('/');
                    } else if (item.path && item.path !== '#') {
                      navigate(item.path);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-6 active:bg-primary/5 transition-all group/item border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/50",
                  )}
                >
                  <div className="flex items-center gap-5">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover/item:scale-110 group-hover/item:shadow-lg", item.color)}>
                      <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'wght' 600" }}>
                        {(item as any).materialIcon || 'link'}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="font-headline font-black text-lg text-on-surface italic block leading-tight">{item.label}</span>
                      {(item as any).isAbout && (
                        <span className="font-label text-[10px] text-on-surface-variant opacity-50 uppercase tracking-wider flex items-center gap-1 mt-1">
                          <ArrowLeft size={10} strokeWidth={3} />
                          Chuyển về trang chủ
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {(item as any).isAbout ? (
                      <div className="w-8 h-8 rounded-full bg-cyan-500/10 dark:bg-cyan-400/15 flex items-center justify-center">
                        <ExternalLink size={14} className="text-cyan-500 dark:text-cyan-400" />
                      </div>
                    ) : (
                      <ChevronRight className="text-outline-variant group-hover/item:translate-x-1 transition-transform" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* 🚀 Sign Out Action */}
        <div className="pt-6">
           <button 
             onClick={logout}
             className="w-full bg-error/5 border-2 border-error/10 text-error h-20 rounded-[2.5rem] font-headline font-black text-xl flex items-center justify-center gap-4 hover:bg-error hover:text-white transition-all active:scale-[0.98] shadow-2xl shadow-error/10 mb-10"
           >
             <LogOut size={24} strokeWidth={3} />
             Đăng xuất
           </button>
           
           <div className="text-center space-y-2 opacity-30 pb-10">
              <p className="font-headline font-black italic text-lg text-primary">PocketFlow PWA</p>
              <p className="font-label text-[10px] font-black uppercase tracking-widest">Version 1.0.5 (Build 2026)</p>
           </div>
        </div>
      </section>

    </div>
  )
}

export default Settings
