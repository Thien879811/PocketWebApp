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

  // 2. Category Breakdown
  const categoryMap: Record<string, { amount: number, count: number }> = {}
  thisMonthTx
    .filter(tx => tx.type === 'expense' && tx.category_id)
    .forEach(tx => {
      const catId = tx.category_id!
      if (!categoryMap[catId]) {
        categoryMap[catId] = { amount: 0, count: 0 }
      }
      categoryMap[catId].amount += tx.amount
      categoryMap[catId].count += 1
    })

  const topCategories = Object.entries(categoryMap)
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
    thisMonthCount: thisMonthTx.filter(tx => tx.type !== 'withdrawal').length
  }
}
