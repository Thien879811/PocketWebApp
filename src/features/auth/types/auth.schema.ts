import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email is not valid').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Email is not valid').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export type RegisterFormValues = z.infer<typeof registerSchema>
