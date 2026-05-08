import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/store/useAuthStore'

export interface BudgetPlan {
  id: string
  user_id: string
  total_budget: number
  start_date: string
  end_date: string
  created_at?: string
  updated_at?: string
}

export const useActiveBudget = () => {
  const user = useAuthStore((state) => state.user)

  return useQuery<BudgetPlan | null>({
    queryKey: ['active-budget', user?.id],
    queryFn: async () => {
      if (!user) return null
      
      const { data, error } = await supabase
        .from('budget_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!user,
  })
}

export const useBudgetHistory = () => {
  const user = useAuthStore((state) => state.user)

  return useQuery<BudgetPlan[]>({
    queryKey: ['budget-history', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('budget_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return data || []
    },
    enabled: !!user,
  })
}

export const useBudgetMutations = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const createBudget = useMutation({
    mutationFn: async ({ total_budget, start_date, end_date }: { total_budget: number, start_date: string, end_date: string }) => {
      if (!user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('budget_plans')
        .insert([{ user_id: user.id, total_budget, start_date, end_date }])
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-budget'] })
    }
  })

  const updateBudget = useMutation({
    mutationFn: async ({ id, total_budget, start_date, end_date }: { id: string, total_budget: number, start_date: string, end_date: string }) => {
      if (!user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('budget_plans')
        .update({ total_budget, start_date, end_date, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-budget'] })
    }
  })

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated')
      
      const { error } = await supabase
        .from('budget_plans')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw new Error(error.message)
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-budget'] })
    }
  })

  return { createBudget, updateBudget, deleteBudget }
}

export const calculateDaysBetween = (start: string, end: string) => {
  const d1 = new Date(start)
  const d2 = new Date(end)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1
}

export const getDailyBudgetStatus = (plan: BudgetPlan, transactions: any[], targetDate: string) => {
  if (targetDate < plan.start_date || targetDate > plan.end_date) {
     return null;
  }

  // Business transactions are excluded from the main budget
  // Withdrawal, Borrow, and Lend are also excluded

  let spentBeforeTarget = 0;
  let spentOnTargetDay = 0;
  let totalSpentSoFar = 0;

  // Compute expenses within the plan timeframe, ignoring excluded categories
  const planTransactions = transactions.filter(tx => 
     tx.type === 'expense' && 
     tx.date >= plan.start_date && 
     tx.date <= plan.end_date
  );

  planTransactions.forEach(exp => {
     totalSpentSoFar += exp.amount;
     if (exp.date < targetDate) {
        spentBeforeTarget += exp.amount;
     } else if (exp.date === targetDate) {
        spentOnTargetDay += exp.amount;
     }
  });

  const remainingTotalAtStartOfDay = plan.total_budget - spentBeforeTarget;
  const remainingDays = calculateDaysBetween(targetDate, plan.end_date);
  
  let allocatedDaily = 0;
  if (remainingDays > 0) {
     allocatedDaily = remainingTotalAtStartOfDay / remainingDays;
  }

  const remainingDaily = allocatedDaily - spentOnTargetDay;
  const currentRemainingTotal = plan.total_budget - totalSpentSoFar;

  return {
     isExceeded: remainingDaily < 0,
     remainingDaily,
     remainingTotal: currentRemainingTotal,
     allocatedDaily,
     budgetEmpty: currentRemainingTotal <= 0,
     totalSpent: totalSpentSoFar
  }
}

