import React from 'react'
import Greeting from '@/features/dashboard/components/Greeting'
import BalanceCard from '@/features/dashboard/components/BalanceCard'
import SummaryBento from '@/features/dashboard/components/SummaryBento'
import InsightsSection from '@/features/dashboard/components/InsightsSection'
import RecentActivity from '@/features/dashboard/components/RecentActivity'

const Home: React.FC = () => {
  return (
    <div className="max-w-lg mx-auto md:max-w-none md:pb-0 relative pb-10">
      <Greeting />
      <BalanceCard />
      
      <div className="md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
           <SummaryBento />
           <InsightsSection />
        </div>
        <div className="md:col-span-1 border-t border-outline-variant/20 pt-8 md:border-none md:pt-0">
           <RecentActivity />
        </div>
      </div>

      {/* 📱 Mobile Floating Action Button (FAB) */}
      <button className="md:hidden fixed right-6 bottom-28 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center justify-center active:scale-90 transition-transform z-40">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  )
}

export default Home
