import { z } from 'zod'

export const transactionSchema = z.object({
  amount: z.number().positive('Amount must be greater than zero'),
  type: z.enum(['income', 'expense', 'withdrawal']),
  category_id: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  account_id: z.string().min(1, 'Please select an account'),
  note: z.string().max(500).optional(),
  receipt_url: z.string().url().optional()
})

export type TransactionFormValues = z.infer<typeof transactionSchema>

export interface Transaction extends TransactionFormValues {
  id: string
  user_id: string
  created_at: string
}
