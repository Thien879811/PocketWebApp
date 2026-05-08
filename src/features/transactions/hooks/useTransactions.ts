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

  const totalBorrow = thisMonthTx
    .filter(tx => tx.type === 'borrow')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const totalLend = thisMonthTx
    .filter(tx => tx.type === 'lend')
    .reduce((acc, curr) => acc + curr.amount, 0)

  // 2. Category Breakdowns (Separated by Type)
  const expenseMap: Record<string, { amount: number, count: number }> = {}
  const incomeMap: Record<string, { amount: number, count: number }> = {}
  const borrowMap: Record<string, { amount: number, count: number }> = {}
  const lendMap: Record<string, { amount: number, count: number }> = {}
  const businessMap: Record<string, { amount: number, count: number }> = {}

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
    } else if (tx.type === 'borrow') {
      if (!borrowMap[tx.category_id]) borrowMap[tx.category_id] = { amount: 0, count: 0 }
      borrowMap[tx.category_id].amount += tx.amount
      borrowMap[tx.category_id].count += 1
    } else if (tx.type === 'lend') {
      if (!lendMap[tx.category_id]) lendMap[tx.category_id] = { amount: 0, count: 0 }
      lendMap[tx.category_id].amount += tx.amount
      lendMap[tx.category_id].count += 1
    } else if (tx.type === 'business') {
      if (!businessMap[tx.category_id]) businessMap[tx.category_id] = { amount: 0, count: 0 }
      businessMap[tx.category_id].amount += tx.amount
      businessMap[tx.category_id].count += 1
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
  const topBorrowCategories = mapToTopList(borrowMap)
  const topLendCategories = mapToTopList(lendMap)
  const topBusinessCategories = mapToTopList(businessMap)
  
  // 3. Business Analysis (Grab KD)
  const businessTransactions = thisMonthTx.filter(tx => tx.type === 'business')
  let businessIncomeTotal = 0
  let businessExpenseTotal = 0
  
  businessTransactions.forEach(tx => {
    const cat = categories.find(c => c.id === tx.category_id)
    const name = cat?.name?.toLowerCase() || ''
    if (name.includes('thu') || name.includes('income')) {
      businessIncomeTotal += tx.amount
    } else {
      // Default to expense if not explicitly 'thu'
      businessExpenseTotal += tx.amount
    }
  })

  // 4. Weekly Trends
  const weeklyTrends = [0, 0, 0, 0, 0] // 5 weeks
  thisMonthTx
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      const d = new Date(tx.date)
      const week = Math.min(Math.floor((d.getDate() - 1) / 7), 4)
      weeklyTrends[week] += tx.amount
    })

  // 4. Monthly Trends (for the entire year)
  const monthlyTrends = Array(12).fill(0)
  const monthlyIncomeTrends = Array(12).fill(0)
  transactions
    .filter(tx => (tx.type === 'expense' || tx.type === 'income') && new Date(tx.date).getFullYear() === currentYear)
    .forEach(tx => {
      const d = new Date(tx.date)
      if (tx.type === 'expense') monthlyTrends[d.getMonth()] += tx.amount
      else if (tx.type === 'income') monthlyIncomeTrends[d.getMonth()] += tx.amount
    })

  // 5. Daily Trends (for the selected month)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const dailyTrends = Array(daysInMonth).fill(0)
  const dailyIncomeTrends = Array(daysInMonth).fill(0)
  const dailyBusinessTrends = Array(daysInMonth).fill(0)
  thisMonthTx
    .forEach(tx => {
      const d = new Date(tx.date)
      if (tx.type === 'expense') dailyTrends[d.getDate() - 1] += tx.amount
      else if (tx.type === 'income') dailyIncomeTrends[d.getDate() - 1] += tx.amount
      else if (tx.type === 'business') {
        const cat = categories.find(c => c.id === tx.category_id)
        const name = cat?.name?.toLowerCase() || ''
        if (name.includes('thu') || name.includes('income')) {
          dailyBusinessTrends[d.getDate() - 1] += tx.amount
        } else {
          dailyBusinessTrends[d.getDate() - 1] -= tx.amount
        }
      }
    })

  return {
    totalBorrow,
    totalLend,
    topCategories,
    topIncomeCategories,
    topBorrowCategories,
    topLendCategories,
    topBusinessCategories,
    weeklyTrends,
    monthlyTrends,
    monthlyIncomeTrends,
    dailyTrends,
    dailyIncomeTrends,
    dailyBusinessTrends,
    businessStats: {
      income: businessIncomeTotal,
      expense: businessExpenseTotal,
      profit: businessIncomeTotal - businessExpenseTotal
    },
    totalIncome: totalIncome + Math.max(0, businessIncomeTotal - businessExpenseTotal),
    totalExpense: totalExpense + Math.max(0, businessExpenseTotal - businessIncomeTotal),
    thisMonthCount: thisMonthTx.filter(tx => !['withdrawal'].includes(tx.type)).length
  }
}
