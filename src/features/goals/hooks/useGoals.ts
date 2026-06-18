import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { type Goal, type GoalFormValues } from '../types/goal.schema'
import { notify } from '@/lib/notify'

export const useGoals = () => {
  const user = useAuthStore((state) => state.user)

  return useQuery<Goal[]>({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return data || []
    },
    enabled: !!user,
  })
}

export const useGoal = (id: string | undefined) => {
  return useQuery<Goal>({
    queryKey: ['goal', id],
    queryFn: async () => {
      if (!id) throw new Error('Goal ID is required')
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!id,
  })
}

export const useCreateGoal = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async (data: GoalFormValues) => {
      if (!user) throw new Error('User not authenticated')

      const { data: goal, error } = await supabase
        .from('goals')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single()

      if (error) throw new Error(error.message)
      return goal
    },
    onSuccess: () => {
      notify.success('Tạo mục tiêu thành công!')
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
    onError: (err: Error) => {
      notify.error(err.message || 'Không thể tạo mục tiêu')
    },
  })
}

export const useUpdateGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GoalFormValues> }) => {
      const { data: goal, error } = await supabase
        .from('goals')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return goal
    },
    onSuccess: () => {
      notify.success('Cập nhật mục tiêu thành công!')
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
    onError: (err: Error) => {
      notify.error(err.message || 'Không thể cập nhật mục tiêu')
    },
  })
}

export const useDeleteGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('goals').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      notify.success('Xóa mục tiêu thành công!')
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
    onError: (err: Error) => {
      notify.error(err.message || 'Không thể xóa mục tiêu')
    },
  })
}
