import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Settings as SettingsIcon, LayoutGrid, Palette, Shield, Info, HelpCircle } from 'lucide-react'

const Settings: React.FC = () => {
  const MENU_ITEMS = [
    {
      title: 'Workspace',
      items: [
        { id: 'categories', label: 'Categories', subLabel: 'Organize spending flow', icon: LayoutGrid, link: '/settings/categories', color: 'bg-primary-container/10 text-primary' },
        { id: 'appearance', label: 'Appearance', subLabel: 'Light & Dark mode', icon: Palette, link: '#', color: 'bg-tertiary-container/10 text-tertiary' },
      ]
    },
    {
      title: 'Security',
      items: [
        { id: 'privacy', label: 'Privacy & Security', subLabel: 'Biometrics & PIN', icon: Shield, link: '#', color: 'bg-secondary-container/10 text-secondary' },
      ]
    },
    {
      title: 'Support',
      items: [
        { id: 'help', label: 'Help Center', subLabel: 'FAQs & Guides', icon: HelpCircle, link: '#', color: 'bg-surface-container-high text-on-surface' },
        { id: 'about', label: 'About PocketFlow', subLabel: 'v1.0.0 Stable', icon: Info, link: '#', color: 'bg-surface-container-high text-on-surface' },
      ]
    }
  ]

  return (
    <div className="max-w-lg mx-auto md:max-w-none pt-4 pb-20 scrollbar-hide">
      {/* 🏔️ Page Header */}
      <section className="mb-10 mt-4 px-2">
        <p className="font-label text-label-sm uppercase tracking-[0.15em] text-on-surface-variant mb-2">Configure</p>
        <div className="flex items-center gap-4">
           <h2 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Settings</h2>
           <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
             <SettingsIcon className="w-5 h-5 text-primary" />
           </div>
        </div>
      </section>

      {/* 📋 Settings Menu Groups */}
      <div className="flex flex-col gap-10">
        {MENU_ITEMS.map((group) => (
          <section key={group.title}>
            <h3 className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-4 px-2">{group.title}</h3>
            <div className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/10 shadow-sm">
              {group.items.map((item, idx) => (
                <Link 
                  key={item.id}
                  to={item.link}
                  className={`flex items-center gap-5 p-5 hover:bg-surface-bright transition-all active:scale-[0.99] group ${
                    idx !== group.items.length - 1 ? 'border-b border-outline-variant/5' : ''
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                     <item.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <span className="block font-headline font-bold text-lg text-on-surface">{item.label}</span>
                    <p className="text-on-surface-variant text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                      {item.subLabel}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-outline-variant group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default Settings
