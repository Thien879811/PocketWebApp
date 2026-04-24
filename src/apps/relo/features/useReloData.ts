import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import type {
  ReloContact, ReloContactFormValues,
  ReloAnniversary, ReloAnniversaryFormValues,
  ReloAppointment, ReloAppointmentFormValues,
  ReloPreference, ReloPreferenceFormValues
} from '../types/relo.types'

// ================================================================
// CONTACTS
// ================================================================
export const useReloContacts = () => {
  const user = useAuthStore((s) => s.user)
  return useQuery<ReloContact[]>({
    queryKey: ['relo_contacts', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('relo_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw new Error(error.message)
      return data || []
    },
    enabled: !!user,
  })
}

export const useCreateReloContact = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: async (values: ReloContactFormValues) => {
      if (!user) throw new Error('Chưa đăng nhập')
      const { data, error } = await supabase
        .from('relo_contacts')
        .insert([{ ...values, user_id: user.id }])
        .select().single()
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relo_contacts'] }),
  })
}

export const useUpdateReloContact = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<ReloContactFormValues> & { id: string }) => {
      const { data, error } = await supabase
        .from('relo_contacts')
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq('id', id).select().single()
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relo_contacts'] }),
  })
}

export const useDeleteReloContact = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('relo_contacts').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relo_contacts'] }),
  })
}

// ================================================================
// ANNIVERSARIES
// ================================================================
export const useReloAnniversaries = () => {
  const user = useAuthStore((s) => s.user)
  return useQuery<ReloAnniversary[]>({
    queryKey: ['relo_anniversaries', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('relo_anniversaries')
        .select('*, relo_contacts(name, avatar_url)')
        .eq('user_id', user.id)
        .order('anniversary_date', { ascending: true })
      if (error) throw new Error(error.message)
      return data || []
    },
    enabled: !!user,
  })
}

export const useCreateReloAnniversary = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: async (values: ReloAnniversaryFormValues) => {
      if (!user) throw new Error('Chưa đăng nhập')
      const { data, error } = await supabase
        .from('relo_anniversaries')
        .insert([{ ...values, user_id: user.id }])
        .select().single()
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relo_anniversaries'] }),
  })
}

export const useUpdateReloAnniversary = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<ReloAnniversaryFormValues> & { id: string }) => {
      const { data, error } = await supabase
        .from('relo_anniversaries')
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq('id', id).select().single()
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relo_anniversaries'] }),
  })
}

export const useDeleteReloAnniversary = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('relo_anniversaries').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relo_anniversaries'] }),
  })
}

// ================================================================
// APPOINTMENTS
// ================================================================
export const useReloAppointments = () => {
  const user = useAuthStore((s) => s.user)
  return useQuery<ReloAppointment[]>({
    queryKey: ['relo_appointments', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('relo_appointments')
        .select('*, relo_contacts(name, avatar_url)')
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: true })
      if (error) throw new Error(error.message)
      return data || []
    },
    enabled: !!user,
  })
}

export const useCreateReloAppointment = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: async (values: ReloAppointmentFormValues) => {
      if (!user) throw new Error('Chưa đăng nhập')
      const { data, error } = await supabase
        .from('relo_appointments')
        .insert([{ ...values, user_id: user.id }])
        .select().single()
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relo_appointments'] }),
  })
}

export const useUpdateReloAppointment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<ReloAppointmentFormValues> & { id: string }) => {
      const { data, error } = await supabase
        .from('relo_appointments')
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq('id', id).select().single()
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relo_appointments'] }),
  })
}

export const useDeleteReloAppointment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('relo_appointments').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relo_appointments'] }),
  })
}

// ================================================================
// PREFERENCES
// ================================================================
export const useReloPreferences = (contactId?: string) => {
  const user = useAuthStore((s) => s.user)
  return useQuery<ReloPreference[]>({
    queryKey: ['relo_preferences', user?.id, contactId],
    queryFn: async () => {
      if (!user) return []
      let query = supabase
        .from('relo_preferences')
        .select('*, relo_contacts(name, avatar_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (contactId) query = query.eq('contact_id', contactId)
      const { data, error } = await query
      if (error) throw new Error(error.message)
      return data || []
    },
    enabled: !!user,
  })
}

export const useCreateReloPreference = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: async (values: ReloPreferenceFormValues) => {
      if (!user) throw new Error('Chưa đăng nhập')
      const { data, error } = await supabase
        .from('relo_preferences')
        .insert([{ ...values, user_id: user.id }])
        .select().single()
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relo_preferences'] }),
  })
}

export const useDeleteReloPreference = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('relo_preferences').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relo_preferences'] }),
  })
}

// ================================================================
// HELPERS
// ================================================================

/** Tính số ngày còn lại đến anniversary (năm hiện tại hoặc tiếp theo) */
export const daysUntilAnniversary = (dateStr: string): number => {
  const today = new Date()
  const raw = new Date(dateStr)
  const next = new Date(today.getFullYear(), raw.getMonth(), raw.getDate())
  if (next < today) next.setFullYear(today.getFullYear() + 1)
  const diff = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

/** Tính số ngày đã qua kể từ một ngày */
export const daysSince = (dateStr: string): number => {
  const today = new Date()
  const date = new Date(dateStr)
  return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

/** Format ngày theo định dạng tiếng Việt */
export const formatDateVN = (dateStr: string): string => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })
}
