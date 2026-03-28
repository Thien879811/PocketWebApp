import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { type TransactionFormValues } from '../types/transaction.schema'

export const useCreateTransaction = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async (data: TransactionFormValues) => {
      if (!user) throw new Error('User not authenticated')

      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert([
          {
            ...data,
            user_id: user.id,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw new Error(error.message)

      return transaction
    },
    onSuccess: () => {
      // Refresh transaction lists
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      // Navigate back to home
      navigate('/', { replace: true })
    },
    onError: (error: any) => {
      console.error('Failed to create transaction:', error.message)
    }
  })
}
