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

      // 3. Update Balances
      if (data.type === 'withdrawal') {
        // Decrease source account
        await supabase
          .from('accounts')
          .update({ balance: (account.balance || 0) - data.amount })
          .eq('id', data.account_id)

        // Find and increase cash account
        const { data: cashAccount, error: cashError } = await supabase
          .from('accounts')
          .select('id, balance')
          .eq('user_id', user.id)
          .eq('type', 'cash')
          .single()

        if (!cashError && cashAccount) {
          await supabase
            .from('accounts')
            .update({ balance: (cashAccount.balance || 0) + data.amount })
            .eq('id', cashAccount.id)
        }
      } else {
        const newBalance = data.type === 'income' 
          ? (account.balance || 0) + data.amount 
          : (account.balance || 0) - data.amount

        await supabase
          .from('accounts')
          .update({ balance: newBalance })
          .eq('id', data.account_id)
      }

      return transaction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      navigate('/')
    },
  })
}

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TransactionFormValues }) => {
      if (!user) throw new Error('User not authenticated')

      // 1. Get old transaction to revert balance
      const { data: oldTx, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw new Error(fetchError.message)

      // 2. Revert old transaction balance
      const { data: oldAccount, error: oldAccError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', oldTx.account_id)
        .single()

      if (oldAccError) throw new Error(oldAccError.message)

      if (oldTx.type === 'withdrawal') {
        // Increase source account
        await supabase
          .from('accounts')
          .update({ balance: (oldAccount.balance || 0) + oldTx.amount })
          .eq('id', oldTx.account_id)

        // Find and decrease cash account
        const { data: cashAccount, error: cashError } = await supabase
          .from('accounts')
          .select('id, balance')
          .eq('user_id', user.id)
          .eq('type', 'cash')
          .single()

        if (!cashError && cashAccount) {
          await supabase
            .from('accounts')
            .update({ balance: (cashAccount.balance || 0) - oldTx.amount })
            .eq('id', cashAccount.id)
        }
      } else {
        const revertedOldBalance = oldTx.type === 'income'
          ? (oldAccount.balance || 0) - oldTx.amount
          : (oldAccount.balance || 0) + oldTx.amount

        await supabase
          .from('accounts')
          .update({ balance: revertedOldBalance })
          .eq('id', oldTx.account_id)
      }

      // 3. Update Transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (txError) throw new Error(txError.message)

      // 4. Apply new transaction balance
      const { data: newAccount, error: newAccError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', data.account_id)
        .single()

      if (newAccError) throw new Error(newAccError.message)

      if (data.type === 'withdrawal') {
        // Decrease source account
        await supabase
          .from('accounts')
          .update({ balance: (newAccount.balance || 0) - data.amount })
          .eq('id', data.account_id)

        // Find and increase cash account
        const { data: cashAccount, error: cashError } = await supabase
          .from('accounts')
          .select('id, balance')
          .eq('user_id', user.id)
          .eq('type', 'cash')
          .single()

        if (!cashError && cashAccount) {
          await supabase
            .from('accounts')
            .update({ balance: (cashAccount.balance || 0) + data.amount })
            .eq('id', cashAccount.id)
        }
      } else {
        const newBalance = data.type === 'income'
          ? (newAccount.balance || 0) + data.amount
          : (newAccount.balance || 0) - data.amount

        await supabase
          .from('accounts')
          .update({ balance: newBalance })
          .eq('id', data.account_id)
      }

      return transaction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      navigate('/')
    },
  })
}

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated')

      // 1. Get transaction to revert balance
      const { data: tx, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw new Error(fetchError.message)

      // 2. Revert balances
      const { data: account, error: accError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', tx.account_id)
        .single()

      if (accError) throw new Error(accError.message)

      if (tx.type === 'withdrawal') {
        // Increase source account
        await supabase
          .from('accounts')
          .update({ balance: (account.balance || 0) + tx.amount })
          .eq('id', tx.account_id)

        // Find and decrease cash account
        const { data: cashAccount, error: cashError } = await supabase
          .from('accounts')
          .select('id, balance')
          .eq('user_id', user.id)
          .eq('type', 'cash')
          .single()

        if (!cashError && cashAccount) {
          await supabase
            .from('accounts')
            .update({ balance: (cashAccount.balance || 0) - tx.amount })
            .eq('id', cashAccount.id)
        }
      } else {
        const revertedBalance = tx.type === 'income'
          ? (account.balance || 0) - tx.amount
          : (account.balance || 0) + tx.amount

        await supabase
          .from('accounts')
          .update({ balance: revertedBalance })
          .eq('id', tx.account_id)
      }

      // 3. Delete transaction
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (deleteError) throw new Error(deleteError.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}
