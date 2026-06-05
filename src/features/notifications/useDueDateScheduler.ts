import { useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { useNotificationSettings } from './useNotificationSettings'
import { formatCurrency } from '@/utils/format'

/**
 * Kiểm tra các khoản vay/cho vay đến hạn và chèn notifications vào Supabase.
 * Chạy một lần khi app khởi động, sau đó mỗi 12 tiếng.
 */
export const useDueDateScheduler = () => {
  const user = useAuthStore((s) => s.user)
  const { settings } = useNotificationSettings()

  useEffect(() => {
    if (!user?.id || !settings.enabled || !settings.due_date_reminder) return

    const checkDueDates = async () => {
      const today = new Date()
      const reminderDate = new Date()
      reminderDate.setDate(today.getDate() + settings.due_date_reminder_days)

      const todayStr = today.toISOString().split('T')[0]
      const reminderDateStr = reminderDate.toISOString().split('T')[0]

      // Lấy các giao dịch borrow/lend có due_date trong khoảng hôm nay → ngày nhắc
      const { data: dueTx, error } = await supabase
        .from('transactions')
        .select('id, type, amount, due_date, note, person_name')
        .eq('user_id', user.id)
        .in('type', ['borrow', 'lend'])
        .not('due_date', 'is', null)
        .gte('due_date', todayStr)
        .lte('due_date', reminderDateStr)

      if (error || !dueTx?.length) return

      for (const tx of dueTx) {
        const dueDate = new Date(tx.due_date!)
        const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        const typeLabel = tx.type === 'borrow' ? 'Khoản vay' : 'Khoản cho vay'
        const actionLabel = tx.type === 'borrow' ? 'trả nợ' : 'đòi nợ'
        const person = tx.person_name ? ` (${tx.person_name})` : ''

        let title: string
        let message: string

        if (diffDays === 0) {
          title = `⚠️ ${typeLabel} đến hạn hôm nay!`
          message = `${typeLabel}${person} ${formatCurrency(tx.amount)} đến hạn ${actionLabel} hôm nay. ${tx.note ? `Ghi chú: ${tx.note}` : ''}`
        } else {
          title = `🔔 Nhắc nhở: ${typeLabel} sắp đến hạn`
          message = `${typeLabel}${person} ${formatCurrency(tx.amount)} sẽ đến hạn ${actionLabel} sau ${diffDays} ngày (${tx.due_date}). ${tx.note ? `Ghi chú: ${tx.note}` : ''}`
        }

        // Kiểm tra đã gửi thông báo hôm nay chưa để tránh spam
        const { data: existingNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('link', `/ledger?tx=${tx.id}`)
          .gte('created_at', todayStr)
          .maybeSingle()

        if (!existingNotif) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            title,
            message,
            link: `/ledger?tx=${tx.id}`,
            is_read: false,
          })
        }
      }
    }

    // Chạy ngay khi khởi động
    checkDueDates()

    // Lặp lại mỗi 12 tiếng
    const interval = setInterval(checkDueDates, 12 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user?.id, settings.enabled, settings.due_date_reminder, settings.due_date_reminder_days])
}
