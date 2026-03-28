import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { type Transaction } from '../types/transaction.schema'

export const useTransactions = () => {
  const user = useAuthStore((state) => state.user)

  return useQuery<Transaction[]>({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw new Error(error.message)
      return data || []
    },
    enabled: !!user,
  })
}

/**
 * 📊 Aggregate statistics from transaction list
 */
export const getTransactionStats = (transactions: Transaction[]) => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Filter current month
  const thisMonthTx = transactions.filter(tx => {
    const d = new Date(tx.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  // 1. Totals
  const totalIncome = thisMonthTx
    .filter(tx => tx.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const totalExpense = thisMonthTx
    .filter(tx => tx.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0)

  // 2. Category Breakdown
  const categoryMap: Record<string, { amount: number, count: number }> = {}
  thisMonthTx
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      if (!categoryMap[tx.category]) {
        categoryMap[tx.category] = { amount: 0, count: 0 }
      }
      categoryMap[tx.category].amount += tx.amount
      categoryMap[tx.category].count += 1
    })

  const topCategories = Object.entries(categoryMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.amount - a.amount)

  // 3. Weekly Trends
  const weeklyTrends = [0, 0, 0, 0, 0] // 5 weeks
  thisMonthTx
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      const d = new Date(tx.date)
      const week = Math.min(Math.floor((d.getDate() - 1) / 7), 4)
      weeklyTrends[week] += tx.amount
    })

  return {
    totalIncome,
    totalExpense,
    topCategories,
    weeklyTrends,
    thisMonthCount: thisMonthTx.length
  }
}
