import { z } from 'zod'

export const transactionSchema = z.object({
  amount: z.number({ error: 'Vui lòng nhập số tiền hợp lệ' }).positive('Số tiền phải lớn hơn 0'),
  type: z.enum(['income', 'expense', 'withdrawal', 'borrow', 'lend', 'business', 'savings']),
  category_id: z.string().optional(),
  goal_id: z.string().optional(), // For linking savings to a goal
  date: z.string().min(1, 'Vui lòng chọn ngày giao dịch'),
  account_id: z.string().min(1, 'Vui lòng chọn tài khoản'),
  note: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
  receipt_url: z.string().url().optional(),
  fee: z.number().or(z.nan()).transform(v => isNaN(v) ? 0 : v).optional(),
  due_date: z.string().optional(),
  person_name: z.string().max(100, 'Tên tối đa 100 ký tự').optional(),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>

export interface Transaction extends TransactionFormValues {
  id: string
  user_id: string
  created_at: string
}
