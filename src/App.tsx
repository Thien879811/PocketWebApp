import React, { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { queryClient } from './lib/queryClient'
import RootRouter from './routes'
import { useAuthStore } from './store/useAuthStore'
import { useThemeStore } from './store/useThemeStore'
import { RealtimeNotifications } from './features/notifications/RealtimeNotifications'

// 👋 PWA REGISTER SCRIPT
import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true })

const App: React.FC = () => {
  const initializeAuth = useAuthStore((state) => state.initialize)
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const initializeTheme = useThemeStore((state) => state.initializeTheme)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <QueryClientProvider client={queryClient}>
      <RootRouter />
      <RealtimeNotifications />
      {/* Global toast container — always mounted, zero default styles */}
      <Toaster
        position="top-center"
        gutter={10}
        containerStyle={{ top: 16 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
            maxWidth: '400px',
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
