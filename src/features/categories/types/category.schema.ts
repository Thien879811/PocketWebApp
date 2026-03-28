import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  icon: z.string().min(1, 'Icon is required'),
  type: z.enum(['income', 'expense']),
  color: z.string().optional(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

export interface Category extends CategoryFormValues {
  id: string
  user_id: string
  created_at: string
}
