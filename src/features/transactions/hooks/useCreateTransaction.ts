import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { type TransactionFormValues } from '../types/transaction.schema'
import { useNavigate } from 'react-router-dom'

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: TransactionFormValues) => {
      if (!user) throw new Error('User not authenticated')

      // 1. Insert Transaction record
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single()

      if (txError) throw new Error(txError.message)

      // 2. Fetch current account balance
      const { data: account, error: accError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', data.account_id)
        .single()

      if (accError) throw new Error(accError.message)

      // 3. Update Balance
      const newBalance = data.type === 'income' 
        ? (account.balance || 0) + data.amount 
        : (account.balance || 0) - data.amount

      const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', data.account_id)

      if (updateError) throw new Error(updateError.message)

      return transaction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] }) // Refresh wallet balance
      navigate('/')
    },
  })
}
