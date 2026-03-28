import React from 'react'
import { 
  User, 
  Bell, 
  ShieldCheck, 
  Palette, 
  Monitor, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Camera,
  Heart,
  Smartphone,
  LayoutGrid,
  Zap,
  Globe
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

const Settings: React.FC = () => {
  const { user, logout } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout
  }))

  const avatarUrl = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || user?.email || 'User')}&background=005da7&color=fff`
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        { icon: Palette, label: 'Appearance', value: 'Light Mode', color: 'bg-primary/10 text-primary' },
        { icon: Bell, label: 'Notifications', value: 'On', color: 'bg-secondary/10 text-secondary' },
        { icon: Globe, label: 'Language', value: 'Tiếng Việt', color: 'bg-tertiary/10 text-tertiary' },
      ]
    },
    {
      title: 'Security',
      items: [
        { icon: ShieldCheck, label: 'Privacy & Safety', color: 'bg-primary/10 text-primary' },
        { icon: Zap, label: 'Connected Apps', color: 'bg-secondary/10 text-secondary' },
      ]
    },
    {
      title: 'About',
      items: [
        { icon: HelpCircle, label: 'Help Center', color: 'bg-primary/10 text-primary' },
        { icon: Heart, label: 'Support Us', color: 'bg-error/10 text-error' },
      ]
    }
  ]

  return (
    <div className="max-w-lg mx-auto md:max-w-none pt-4 pb-24 scrollbar-hide">
      
      {/* 🏔️ Profile Header Area */}
      <section className="mb-12 px-2">
        <h2 className="font-headline font-black text-3xl text-on-surface tracking-tight mb-10">Cài đặt</h2>
        
        <div className="bg-surface-container-lowest p-8 rounded-[3rem] border border-outline-variant/10 shadow-xl shadow-on-surface/[0.02] flex flex-col items-center gap-6 relative overflow-hidden group">
           <div className="relative">
              <div className="w-28 h-28 rounded-[2.5rem] bg-surface-container-high flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl relative z-10">
                 <img alt="Profile" className="w-full h-full object-cover" src={avatarUrl} />
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg z-20 active:scale-90 transition-transform">
                 <Camera size={18} strokeWidth={2.5} />
              </button>
           </div>
           
           <div className="text-center space-y-1 relative z-10">
              <h3 className="font-headline font-black text-2xl tracking-tight text-on-surface">{displayName}</h3>
              <p className="font-label text-sm font-bold text-on-surface-variant opacity-60 px-4 py-1 bg-surface-container-high rounded-full inline-block">{user?.email}</p>
           </div>

           {/* Decorative Background */}
           <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
           <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </section>

      {/* 📱 Settings Groups */}
      <section className="space-y-10 px-2">
        {settingsGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-4">
            <h4 className="px-4 font-label text-[10px] uppercase font-black tracking-[0.2em] text-on-surface-variant opacity-40">{group.title}</h4>
            <div className="bg-surface-container-lowest rounded-[3rem] overflow-hidden border border-outline-variant/10 shadow-sm">
              {group.items.map((item, iIdx) => (
                <button
                  key={iIdx}
                  className={cn(
                    "w-full flex items-center justify-between p-6 active:bg-primary/5 transition-all group border-b border-outline-variant/10 last:border-0",
                  )}
                >
                  <div className="flex items-center gap-5">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110", item.color)}>
                      <item.icon size={26} strokeWidth={2.5} />
                    </div>
                    <span className="font-headline font-black text-lg text-on-surface text-left">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.value && <span className="font-label text-xs font-black text-on-surface-variant opacity-40 uppercase tracking-tighter">{item.value}</span>}
                    <ChevronRight className="text-outline-variant group-hover:translate-x-1 transition-transform" />
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
              <p className="font-label text-[10px] font-black uppercase tracking-widest">Version 1.0.4 (Build 2026)</p>
           </div>
        </div>
      </section>

    </div>
  )
}

export default Settings
