import { z } from 'zod'

export const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(50),
  balance: z.number(),
  type: z.enum(['cash', 'bank', 'credit']),
  color: z.string().optional(),
  icon: z.string().optional(),
  limit: z.number().optional(), // For credit cards
  provider: z.string().optional(), // e.g., VCB, HSBC
})

export type AccountFormValues = z.infer<typeof accountSchema>

export interface Account extends AccountFormValues {
  id: string
  user_id: string
  created_at: string
}
