import React, { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '@/utils/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { Bell } from 'lucide-react';
import { router } from '@/routes';

export const RealtimeNotifications: React.FC = () => {
  const user = useAuthStore((s) => s.user);


  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const newNotif = payload.new;
          
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-sm w-full bg-surface-container-lowest dark:bg-surface-container shadow-lg dark:shadow-dark rounded-2xl pointer-events-auto flex border border-outline-variant/20 dark:border-outline-variant/10 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform`}
              onClick={() => {
                toast.dismiss(t.id);
                if (newNotif.link) {
                  router.navigate(newNotif.link);
                }
              }}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-full bg-primary-container/80 dark:bg-primary/20 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-on-surface">
                      {newNotif.title}
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                      {newNotif.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-outline-variant/20 dark:border-outline-variant/10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(t.id);
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-2xl px-4 flex items-center justify-center text-sm font-semibold text-primary hover:bg-primary-container/20 dark:hover:bg-primary/10 transition-colors focus:outline-none"
                >
                  Đóng
                </button>
              </div>
            </div>
          ), { duration: 6000 });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className: '!bg-surface-container-lowest dark:!bg-surface-container !text-on-surface !rounded-2xl !shadow-lg border border-outline-variant/10',
      }}
    />
  );
};
