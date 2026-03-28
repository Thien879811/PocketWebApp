import { z } from 'zod'

export const goalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100),
  target_amount: z.number().or(z.nan()).transform((val) => (val === null || (typeof val === 'number' && isNaN(val)) ? 0 : val)),
  current_amount: z.number().or(z.nan()).transform((val) => (val === null || (typeof val === 'number' && isNaN(val)) ? 0 : val)),
  target_date: z.string().optional(),
  icon: z.string().min(1, 'Icon is required'),
  status: z.enum(['active', 'completed', 'paused']),
  color: z.string().optional(),
})

export type GoalFormValues = z.infer<typeof goalSchema>

export interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  target_date?: string
  icon: string
  status: 'active' | 'completed' | 'paused'
  color?: string
  user_id: string
  created_at: string
}
