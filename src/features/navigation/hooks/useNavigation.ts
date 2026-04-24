import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { type AppNavigation, type AppNavigationFormValues } from '../types/navigation.schema'

// Default navigation items to seed for new users
const DEFAULT_NAV_ITEMS: Omit<AppNavigationFormValues, 'user_id'>[] = [
  // Quick Links group
  { group_key: 'quick_links', group_label: 'Liên kết nhanh', item_label: 'Trang chủ', item_path: '/', item_icon: 'home', item_color: 'bg-blue-500/10 text-blue-500 dark:bg-blue-400/15 dark:text-blue-400', sort_order: 0 },
  { group_key: 'quick_links', group_label: 'Liên kết nhanh', item_label: 'Sổ giao dịch', item_path: '/ledger', item_icon: 'receipt_long', item_color: 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/15 dark:text-indigo-400', sort_order: 1 },
  { group_key: 'quick_links', group_label: 'Liên kết nhanh', item_label: 'Thống kê', item_path: '/stats', item_icon: 'insights', item_color: 'bg-violet-500/10 text-violet-500 dark:bg-violet-400/15 dark:text-violet-400', sort_order: 2 },
  { group_key: 'quick_links', group_label: 'Liên kết nhanh', item_label: 'Ví tiền', item_path: '/wallet', item_icon: 'account_balance_wallet', item_color: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/15 dark:text-emerald-400', sort_order: 3 },
  { group_key: 'quick_links', group_label: 'Liên kết nhanh', item_label: 'Kế hoạch chi tiêu', item_path: '/budget', item_icon: 'savings', item_color: 'bg-amber-500/10 text-amber-500 dark:bg-amber-400/15 dark:text-amber-400', sort_order: 4 },
  
  // Preferences group
  { group_key: 'preferences', group_label: 'Tùy chỉnh', item_label: 'Danh mục chi tiêu', item_path: '/settings/categories', item_icon: 'category', item_color: 'bg-primary/10 text-primary', sort_order: 0 },
  { group_key: 'preferences', group_label: 'Tùy chỉnh', item_label: 'Mục tiêu tích lũy', item_path: '/goals', item_icon: 'flag', item_color: 'bg-green-600/10 text-green-600', sort_order: 1 },
  { group_key: 'preferences', group_label: 'Tùy chỉnh', item_label: 'Lịch sử ngân sách', item_path: '/settings/budget-history', item_icon: 'history', item_color: 'bg-secondary/10 text-secondary', sort_order: 2 },
  { group_key: 'preferences', group_label: 'Tùy chỉnh', item_label: 'Biến động số dư', item_path: '/settings/balance-history', item_icon: 'trending_up', item_color: 'bg-primary/10 text-primary', sort_order: 3 },
  
  // System group
  { group_key: 'system', group_label: 'Hệ thống', item_label: 'Về PocketWebApp', item_path: '/', item_icon: 'info', item_color: 'bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/15 dark:text-cyan-400', sort_order: 0, is_external: false },
]

/**
 * Hook to fetch user navigation items from Supabase.
 * If no items exist for the user, seeds default items automatically.
 */
export const useNavigation = () => {
  const user = useAuthStore((state) => state.user)

  return useQuery<AppNavigation[]>({
    queryKey: ['app_navigation', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('app_navigation')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('group_key', { ascending: true })
        .order('sort_order', { ascending: true })

      if (error) throw new Error(error.message)

      // Seed defaults if no navigation exists for this user
      if (!data || data.length === 0) {
        const seedItems = DEFAULT_NAV_ITEMS.map(item => ({
          ...item,
          user_id: user.id,
        }))

        const { data: seeded, error: seedError } = await supabase
          .from('app_navigation')
          .insert(seedItems)
          .select()

        if (seedError) throw new Error(seedError.message)
        return seeded || []
      }

      return data
    },
    enabled: !!user,
  })
}

/**
 * Hook to create a new navigation item.
 */
export const useCreateNavItem = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async (data: AppNavigationFormValues) => {
      if (!user) throw new Error('User not authenticated')

      const { data: item, error } = await supabase
        .from('app_navigation')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single()

      if (error) throw new Error(error.message)
      return item
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app_navigation'] })
    },
  })
}

/**
 * Hook to update an existing navigation item.
 */
export const useUpdateNavItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AppNavigationFormValues> & { id: string }) => {
      const { data: item, error } = await supabase
        .from('app_navigation')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return item
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app_navigation'] })
    },
  })
}

/**
 * Hook to delete a navigation item.
 */
export const useDeleteNavItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('app_navigation').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app_navigation'] })
    },
  })
}
