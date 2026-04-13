import React, { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/queryClient'
import RootRouter from './routes'
import { useAuthStore } from './store/useAuthStore'
import { useThemeStore } from './store/useThemeStore'

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
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
