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

export const useTransaction = (id: string | undefined) => {
  return useQuery<Transaction>({
    queryKey: ['transaction', id],
    queryFn: async () => {
      if (!id) throw new Error('Transaction ID is required')
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!id,
  })
}

import { type Category } from '@/features/categories/types/category.schema'

/**
 * 📊 Aggregate statistics from transaction list
 */
export const getTransactionStats = (transactions: Transaction[], categories: Category[] = [], targetDate: Date = new Date()) => {
  const currentMonth = targetDate.getMonth()
  const currentYear = targetDate.getFullYear()

  // Filter Target month
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

  // 2. Category Breakdowns (Separated by Type)
  const expenseMap: Record<string, { amount: number, count: number }> = {}
  const incomeMap: Record<string, { amount: number, count: number }> = {}

  thisMonthTx.forEach(tx => {
    if (!tx.category_id) return
    
    if (tx.type === 'expense') {
      if (!expenseMap[tx.category_id]) expenseMap[tx.category_id] = { amount: 0, count: 0 }
      expenseMap[tx.category_id].amount += tx.amount
      expenseMap[tx.category_id].count += 1
    } else if (tx.type === 'income') {
      if (!incomeMap[tx.category_id]) incomeMap[tx.category_id] = { amount: 0, count: 0 }
      incomeMap[tx.category_id].amount += tx.amount
      incomeMap[tx.category_id].count += 1
    }
  })

  const mapToTopList = (map: Record<string, { amount: number, count: number }>) => 
    Object.entries(map)
      .map(([categoryId, data]) => {
        const catInfo = categories.find(c => c.id === categoryId)
        return { 
          name: catInfo?.name || 'Unknown',
          id: categoryId,
          ...data, 
          limit: catInfo?.limit || 0,
          icon: catInfo?.icon || 'payments',
          color: catInfo?.color || 'bg-primary'
        }
      })
      .sort((a, b) => b.amount - a.amount)

  const topCategories = mapToTopList(expenseMap)
  const topIncomeCategories = mapToTopList(incomeMap)

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
    topIncomeCategories,
    weeklyTrends,
    thisMonthCount: thisMonthTx.filter(tx => tx.type !== 'withdrawal').length
  }
}
