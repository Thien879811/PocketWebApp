import { useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import toast from 'react-hot-toast'

export interface ScheduledNotification {
  id: string
  user_id: string
  title: string
  message: string
  scheduled_at: string
  sent: boolean
}

export const useCustomNotificationScheduler = () => {
  const user = useAuthStore((s) => s.user)
  const timersRef = useRef<{ [id: string]: NodeJS.Timeout }>({})

  useEffect(() => {
    if (!user?.id) return

    const loadAndSchedule = async () => {
      // Clear existing timers
      Object.values(timersRef.current).forEach(clearTimeout)
      timersRef.current = {}

      // Fetch pending scheduled notifications
      const { data, error } = await supabase
        .from('scheduled_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('sent', false)

      if (error || !data) return

      data.forEach((notif: ScheduledNotification) => {
        const targetTime = new Date(notif.scheduled_at).getTime()
        const now = Date.now()
        const delay = Math.max(0, targetTime - now)

        const triggerNotif = async () => {
          // 1. Show native browser notification if allowed
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(notif.title, {
                body: notif.message,
                icon: '/pwa-192x192.png',
              })
            } catch (err) {
              console.error('Error showing native notification:', err)
            }
          }

          // 2. Show in-app toast
          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-sm w-full bg-surface-container-lowest dark:bg-surface-container shadow-lg dark:shadow-dark rounded-2xl pointer-events-auto flex border border-outline-variant/20 dark:border-outline-variant/10 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform`}
                onClick={() => toast.dismiss(t.id)}
              >
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <div className="h-10 w-10 rounded-full bg-primary-container/80 dark:bg-primary/20 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-semibold text-on-surface">{notif.title}</p>
                      <p className="mt-1 text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-outline-variant/20 dark:border-outline-variant/10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toast.dismiss(t.id)
                    }}
                    className="w-full border border-transparent rounded-none rounded-r-2xl px-4 flex items-center justify-center text-sm font-semibold text-primary hover:bg-primary-container/20 dark:hover:bg-primary/10 transition-colors focus:outline-none"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ),
            { duration: 8000 }
          )

          // 3. Mark as sent
          await supabase
            .from('scheduled_notifications')
            .update({ sent: true, updated_at: new Date().toISOString() })
            .eq('id', notif.id)

          await supabase.from('notifications').insert({
            user_id: user.id,
            title: notif.title,
            message: notif.message,
            is_read: false,
          })
        }

        timersRef.current[notif.id] = setTimeout(triggerNotif, delay)
      })
    }

    loadAndSchedule()

    // Realtime subscription for new notifications added while app is open
    const channel = supabase
      .channel('public:scheduled_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scheduled_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const notif = payload.new as ScheduledNotification
          if (notif.sent) return

          const targetTime = new Date(notif.scheduled_at).getTime()
          const now = Date.now()
          const delay = Math.max(0, targetTime - now)

          const triggerNotif = async () => {
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(notif.title, {
                  body: notif.message,
                  icon: '/pwa-192x192.png',
                })
              } catch (err) {
                console.error(err)
              }
            }

            toast.custom(
              (t) => (
                <div
                  className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                  } max-w-sm w-full bg-surface-container-lowest dark:bg-surface-container shadow-lg dark:shadow-dark rounded-2xl pointer-events-auto flex border border-outline-variant/20 dark:border-outline-variant/10 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform`}
                  onClick={() => toast.dismiss(t.id)}
                >
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <div className="h-10 w-10 rounded-full bg-primary-container/80 dark:bg-primary/20 flex items-center justify-center">
                          <Bell className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-semibold text-on-surface">{notif.title}</p>
                        <p className="mt-1 text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex border-l border-outline-variant/20 dark:border-outline-variant/10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toast.dismiss(t.id)
                      }}
                      className="w-full border border-transparent rounded-none rounded-r-2xl px-4 flex items-center justify-center text-sm font-semibold text-primary hover:bg-primary-container/20 dark:hover:bg-primary/10 transition-colors focus:outline-none"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              ),
              { duration: 8000 }
            )

            await supabase
              .from('scheduled_notifications')
              .update({ sent: true, updated_at: new Date().toISOString() })
              .eq('id', notif.id)

            await supabase.from('notifications').insert({
              user_id: user.id,
              title: notif.title,
              message: notif.message,
              is_read: false,
            })
          }

          if (timersRef.current[notif.id]) {
            clearTimeout(timersRef.current[notif.id])
          }

          timersRef.current[notif.id] = setTimeout(triggerNotif, delay)
        }
      )
      .subscribe()

    return () => {
      Object.values(timersRef.current).forEach(clearTimeout)
      supabase.removeChannel(channel)
    }
  }, [user?.id])
}
