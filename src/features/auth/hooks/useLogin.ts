import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/utils/supabase'
import { loginSchema, type LoginFormValues } from '../types/auth.schema'
import { notify } from '@/lib/notify'

export const useLogin = () => {
  const navigate = useNavigate()

  // 📋 REACT HOOK FORM SETUP
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // 🚀 REACT QUERY MUTATION (SUPABASE AUTH)
  const mutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        throw new Error(error.message)
      }

      return authData
    },
    onSuccess: () => {
      notify.success('Đăng nhập thành công!')
      navigate('/', { replace: true })
    },
    onError: (error: any) => {
      notify.error(error.message || 'Đăng nhập thất bại')
    }
  })

  // ⚡ HANDLERS
  const onSubmit = (data: LoginFormValues) => {
    mutation.mutate(data)
  }

  return {
    form,
    onSubmit,
    isLoading: mutation.isPending,
    error: mutation.error
  }
}
