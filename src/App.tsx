import React, { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/queryClient'
import RootRouter from './routes'
import { useAuthStore } from './store/useAuthStore'

// 👋 PWA REGISTER SCRIPT
import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true })

const App: React.FC = () => {
  const initializeAuth = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <RootRouter />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
