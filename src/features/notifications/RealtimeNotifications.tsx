import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { Bell, X } from 'lucide-react';
import { router } from '@/routes';
import { useDueDateScheduler } from './useDueDateScheduler';
import { useCustomNotificationScheduler } from './useCustomNotificationScheduler';
import { registerFCM } from './RegisterNotification';

// ─── Realtime notification card ────────────────────────────
function RealtimeCard({
  t,
  title,
  message,
  link,
}: {
  t: any
  title: string
  message: string
  link?: string
}) {
  const visible = t.visible

  return (
    <div
      onClick={() => {
        toast.dismiss(t.id)
        if (link) router.navigate(link)
      }}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        width: '100%',
        maxWidth: 360,
        minWidth: 280,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.13) 0%, rgba(79,70,229,0.08) 100%)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 16,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        cursor: link ? 'pointer' : 'default',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
        transition: 'opacity 0.22s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: 'auto',
        animation: visible ? 'notifyIn 0.32s cubic-bezier(0.34,1.56,0.64,1) forwards' : undefined,
        boxSizing: 'border-box',
      }}
    >
      {/* Left accent */}
      <div style={{
        width: 4,
        background: 'linear-gradient(180deg, #6366f1, #4f46e5)',
        flexShrink: 0,
      }} />

      {/* Icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        flexShrink: 0,
        padding: '12px 0',
      }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: 'rgba(99,102,241,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Bell size={16} strokeWidth={2} color="#6366f1" />
        </div>
      </div>

      {/* Body */}
      <div style={{
        flex: 1,
        padding: '12px 8px 12px 4px',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        minWidth: 0,
      }}>
        <p style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 600,
          color: '#312e81',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {title}
        </p>
        <p style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 400,
          color: '#4338ca',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
          opacity: 0.85,
        }}>
          {message}
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id) }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '12px 12px 12px 4px',
          display: 'flex',
          alignItems: 'flex-start',
          color: '#6366f1',
          opacity: 0.6,
          flexShrink: 0,
        }}
        aria-label="Đóng"
      >
        <X size={15} strokeWidth={2.5} />
      </button>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────
export const RealtimeNotifications: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  useDueDateScheduler();
  useCustomNotificationScheduler();

  useEffect(() => {
    if (user?.id) {
      registerFCM(user.id);
    }
  }, [user?.id]);

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
          const n = payload.new;
          toast.custom(
            (t) => (
              <RealtimeCard t={t} title={n.title} message={n.message} link={n.link} />
            ),
            { duration: 6000, position: 'top-center' },
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Toaster is now rendered in App.tsx — no Toaster here
  return null;
};
