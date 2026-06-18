import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { type TransactionFormValues } from '../types/transaction.schema'
import { useNavigate } from 'react-router-dom'
import { notify } from '@/lib/notify'

/**
 * All balance mutations now go through PostgreSQL stored functions (RPC)
 * that execute inside a SINGLE database transaction.
 *
 * If ANY step fails (insert, balance update, goal update, snapshot),
 * the entire operation is rolled back automatically — no partial state.
 *
 * Required RPC functions (run supabase/migrations/20260618_transaction_atomic_rpc.sql):
 *   - create_transaction(...)
 *   - update_transaction(...)
 *   - delete_transaction(...)
 */

// ─── CREATE ─────────────────────────────────────────────
export const useCreateTransaction = () => {
    const queryClient = useQueryClient()
    const user = useAuthStore((state) => state.user)
    const navigate = useNavigate()

    return useMutation({
        mutationFn: async (data: TransactionFormValues) => {
            if (!user) throw new Error('User not authenticated')

            const { data: transaction, error } = await supabase.rpc('create_transaction', {
                p_user_id: user.id,
                p_amount: data.amount,
                p_type: data.type,
                p_category_id: data.category_id ?? null,
                p_goal_id: data.goal_id ?? null,
                p_date: data.date,
                p_account_id: data.account_id,
                p_note: data.note ?? null,
                p_fee: data.fee ?? 0,
                p_due_date: data.due_date ?? null,
                p_person_name: data.person_name ?? null,
            })

            if (error) throw new Error(error.message)
            return transaction
        },
        onSuccess: () => {
            notify.success('Tạo giao dịch thành công!')
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            queryClient.invalidateQueries({ queryKey: ['accounts'] })
            queryClient.invalidateQueries({ queryKey: ['goals'] })
            queryClient.invalidateQueries({ queryKey: ['daily_balance_logs'] })
            navigate('/')
        },
        onError: (err: Error) => {
            notify.error(err.message || 'Không thể tạo giao dịch')
        },
    })
}

// ─── UPDATE ─────────────────────────────────────────────
export const useUpdateTransaction = () => {
    const queryClient = useQueryClient()
    const user = useAuthStore((state) => state.user)
    const navigate = useNavigate()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: TransactionFormValues }) => {
            if (!user) throw new Error('User not authenticated')

            const { data: transaction, error } = await supabase.rpc('update_transaction', {
                p_tx_id: id,
                p_user_id: user.id,
                p_amount: data.amount,
                p_type: data.type,
                p_category_id: data.category_id ?? null,
                p_goal_id: data.goal_id ?? null,
                p_date: data.date,
                p_account_id: data.account_id,
                p_note: data.note ?? null,
                p_fee: data.fee ?? 0,
                p_due_date: data.due_date ?? null,
                p_person_name: data.person_name ?? null,
            })

            if (error) throw new Error(error.message)
            return transaction
        },
        onSuccess: () => {
            notify.success('Cập nhật giao dịch thành công!')
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            queryClient.invalidateQueries({ queryKey: ['accounts'] })
            queryClient.invalidateQueries({ queryKey: ['goals'] })
            queryClient.invalidateQueries({ queryKey: ['daily_balance_logs'] })
            navigate('/')
        },
        onError: (err: Error) => {
            notify.error(err.message || 'Không thể cập nhật giao dịch')
        },
    })
}

// ─── DELETE ─────────────────────────────────────────────
export const useDeleteTransaction = () => {
    const queryClient = useQueryClient()
    const user = useAuthStore((state) => state.user)

    return useMutation({
        mutationFn: async (id: string) => {
            if (!user) throw new Error('User not authenticated')

            const { error } = await supabase.rpc('delete_transaction', {
                p_tx_id: id,
                p_user_id: user.id,
            })

            if (error) throw new Error(error.message)
        },
        onSuccess: () => {
            notify.success('Xóa giao dịch thành công!')
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            queryClient.invalidateQueries({ queryKey: ['accounts'] })
            queryClient.invalidateQueries({ queryKey: ['goals'] })
            queryClient.invalidateQueries({ queryKey: ['daily_balance_logs'] })
        },
        onError: (err: Error) => {
            notify.error(err.message || 'Không thể xóa giao dịch')
        },
    })
}
