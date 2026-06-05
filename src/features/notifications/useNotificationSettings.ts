import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/store/useAuthStore'

export interface NotificationSettings {
  id?: string
  user_id?: string
  enabled: boolean
  daily_summary: boolean
  daily_summary_time: string // 'HH:MM'
  budget_alert: boolean
  budget_alert_threshold: number
  due_date_reminder: boolean
  due_date_reminder_days: number
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  daily_summary: false,
  daily_summary_time: '08:00',
  budget_alert: true,
  budget_alert_threshold: 80,
  due_date_reminder: true,
  due_date_reminder_days: 3,
}

export const useNotificationSettings = () => {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notification_settings', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle()

      if (error) throw error
      return data as NotificationSettings | null
    },
  })

  const { mutate: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: async (settings: Partial<NotificationSettings>) => {
      if (!user?.id) throw new Error('Not authenticated')

      const payload = {
        ...settings,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('notification_settings')
        .upsert(payload, { onConflict: 'user_id' })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification_settings', user?.id] })
    },
  })

  const settings: NotificationSettings = data
    ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...data }
    : DEFAULT_NOTIFICATION_SETTINGS

  return { settings, isLoading, saveSettings, isSaving }
}
