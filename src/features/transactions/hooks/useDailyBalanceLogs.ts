import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { type Account } from '@/features/accounts/types/account.schema'

export interface DailyBalanceLog {
  id: string
  user_id: string
  log_date: string        // 'YYYY-MM-DD'
  account_id: string
  balance: number
  note?: string
  created_at: string
  updated_at: string
  // joined
  account?: Account
}

// ─── READ ────────────────────────────────────────────────────────────────────

export const useDailyBalanceLogs = () => {
  const user = useAuthStore((state) => state.user)

  return useQuery<DailyBalanceLog[]>({
    queryKey: ['daily_balance_logs', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('daily_balance_logs')
        .select('*, account:accounts(id, name, type, color, icon, provider)')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) throw new Error(error.message)
      return data || []
    },
    enabled: !!user,
  })
}

// ─── WRITE ───────────────────────────────────────────────────────────────────

/**
 * Snapshot all account balances for a given date.
 * Uses upsert so calling multiple times on the same day is idempotent.
 */
export const useUpsertDailyBalanceLogs = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async ({
      accounts,
      logDate,
      note,
    }: {
      accounts: Account[]
      logDate?: string          // defaults to today
      note?: string
    }) => {
      if (!user) throw new Error('User not authenticated')

      const date = logDate ?? new Date().toISOString().split('T')[0]

      const rows = accounts.map((acc) => ({
        user_id: user.id,
        log_date: date,
        account_id: acc.id,
        balance: acc.balance ?? 0,
        note: note ?? null,
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from('daily_balance_logs')
        .upsert(rows, { onConflict: 'user_id,log_date,account_id' })

      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_balance_logs'] })
    },
  })
}
