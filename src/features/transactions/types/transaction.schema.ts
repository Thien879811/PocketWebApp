import { z } from 'zod'

export const transactionSchema = z.object({
  amount: z.number().positive('Amount must be greater than zero'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  wallet_id: z.string().optional(),
  note: z.string().max(500).optional(),
  receipt_url: z.string().url().optional()
})

export type TransactionFormValues = z.infer<typeof transactionSchema>

export interface Transaction extends TransactionFormValues {
  id: string
  user_id: string
  created_at: string
}
