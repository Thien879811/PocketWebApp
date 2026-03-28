import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  icon: z.string().min(1, 'Icon is required'),
  type: z.enum(['income', 'expense']),
  color: z.string().optional(),
  limit: z.number()
    .or(z.nan())
    .transform((val) => (val === null || (typeof val === 'number' && isNaN(val)) ? null : val))
    .optional()
    .nullable()
})

export type CategoryFormValues = z.infer<typeof categorySchema>

export interface Category {
  id: string
  name: string
  icon: string
  type: 'income' | 'expense'
  color?: string
  limit?: number | null
  user_id: string
  created_at: string
}
