import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/useAuthStore'
import { loginSchema, type LoginFormValues } from '../types/auth.schema'

export const useLogin = () => {
  const navigate = useNavigate()
  const loginAction = useAuthStore((state) => state.login)

  // 📋 REACT HOOK FORM SETUP
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // 🚀 REACT QUERY MUTATION
  const mutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      // API call using Axios instance
      const response = await api.post('/auth/login', data)
      return response.data // Should return { user: {...}, token: "..." }
    },
    onSuccess: (data) => {
      // 1. Update Global State
      loginAction(data.user, data.token)
      // 2. Persistent redirect
      navigate('/', { replace: true })
    },
    onError: (error: any) => {
      // Handle login error globally or locally
      console.error('Login failed:', error.response?.data?.message || error.message)
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
