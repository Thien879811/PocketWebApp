import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/utils/supabase'
import { registerSchema, type RegisterFormValues } from '../types/auth.schema'

export const useRegister = () => {
  const navigate = useNavigate()

  // 📋 REACT HOOK FORM SETUP
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: ''
    }
  })

  // 🚀 REACT QUERY MUTATION (SUPABASE AUTH)
  const mutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          }
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      return authData
    },
    onSuccess: () => {
      // Persistent redirect (Assuming email confirmation is disabled for direct login)
      navigate('/', { replace: true })
    },
    onError: (error: any) => {
      // Handle registration error
      console.error('Registration failed:', error.message)
    }
  })

  // ⚡ HANDLERS
  const onSubmit = (data: RegisterFormValues) => {
    mutation.mutate(data)
  }

  return {
    form,
    onSubmit,
    isLoading: mutation.isPending,
    error: mutation.error
  }
}
