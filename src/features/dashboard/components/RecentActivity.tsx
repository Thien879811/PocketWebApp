import React from 'react'

const transactions = [
  { id: 1, name: 'Apple Store', category: 'Electronics', date: 'Oct 24', amount: '- ¥1,200.00', icon: 'shopping_bag', type: 'expense' },
  { id: 2, name: 'Sushi Zen', category: 'Dining', date: 'Oct 23', amount: '- ¥150.20', icon: 'restaurant', type: 'expense' },
  { id: 3, name: 'Salary Deposit', category: 'Monthly Pay', date: 'Oct 21', amount: '+ ¥4,500.00', icon: 'work', type: 'income' },
  { id: 4, name: 'Uber Ride', category: 'Transport', date: 'Oct 20', amount: '- ¥45.00', icon: 'directions_car', type: 'expense' },
  { id: 5, name: 'Netflix', category: 'Media', date: 'Oct 19', amount: '- ¥12.99', icon: 'subscriptions', type: 'expense' }
]

const RecentActivity: React.FC = () => {
  return (
    <section className="space-y-6 mt-8">
      <div className="flex justify-between items-end">
        <h2 className="text-xl font-bold font-headline">Recent Activity</h2>
        <button className="text-primary text-sm font-bold hover:underline">View All</button>
      </div>
      <div className="space-y-4">
        {transactions.map((tx, index) => (
          <div key={tx.id} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer hover:bg-surface-container transition-colors ${index % 2 === 0 ? 'bg-surface-container-lowest shadow-sm border border-outline-variant/10' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-primary">{tx.icon}</span>
              </div>
              <div>
                <p className="font-bold text-sm text-on-surface">{tx.name}</p>
                <p className="text-[10px] text-on-surface-variant uppercase font-medium mt-0.5 font-label">{tx.date} • {tx.category}</p>
              </div>
            </div>
            <p className={`font-bold ${tx.type === 'income' ? 'text-secondary' : 'text-error'}`}>
              {tx.amount}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default RecentActivity
