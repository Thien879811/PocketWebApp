import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { type Category, type CategoryFormValues } from '../types/category.schema'
import { notify } from '@/lib/notify'

export const useCategories = () => {
  const user = useAuthStore((state) => state.user)

  return useQuery<Category[]>({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (error) throw new Error(error.message)
      return data || []
    },
    enabled: !!user,
  })
}

export const useCategory = (id: string | undefined) => {
  return useQuery<Category>({
    queryKey: ['category', id],
    queryFn: async () => {
      if (!id) throw new Error('Category ID is required')
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!id,
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      if (!user) throw new Error('User not authenticated')

      const { data: category, error } = await supabase
        .from('categories')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single()

      if (error) throw new Error(error.message)
      return category
    },
    onSuccess: () => {
      notify.success('Tạo danh mục thành công!')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err: Error) => {
      notify.error(err.message || 'Không thể tạo danh mục')
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryFormValues> }) => {
      const { data: category, error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return category
    },
    onSuccess: () => {
      notify.success('Cập nhật danh mục thành công!')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err: Error) => {
      notify.error(err.message || 'Không thể cập nhật danh mục')
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      notify.success('Xóa danh mục thành công!')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err: Error) => {
      notify.error(err.message || 'Không thể xóa danh mục')
    },
  })
}
