import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { type Account, type AccountFormValues } from '../types/account.schema'

export const useAccounts = () => {
  const user = useAuthStore((state) => state.user)

  return useQuery<Account[]>({
    queryKey: ['accounts', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw new Error(error.message)
      return data || []
    },
    enabled: !!user,
  })
}

export const useCreateAccount = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async (data: AccountFormValues) => {
      if (!user) throw new Error('User not authenticated')

      const { data: account, error } = await supabase
        .from('accounts')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single()

      if (error) throw new Error(error.message)
      return account
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export const useDeleteAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('accounts').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export const useBalanceHistory = () => {
  const user = useAuthStore((state) => state.user)

  return useQuery({
    queryKey: ['balance_history', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('daily_balance_logs')
        .select(`
          *,
          accounts (
            name,
            color
          )
        `)
        .eq('user_id', user.id)
        .order('log_date', { ascending: false })

      if (error) throw new Error(error.message)
      return data || []
    },
    enabled: !!user,
  })
}
