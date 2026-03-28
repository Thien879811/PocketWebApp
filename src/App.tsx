import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/queryClient'
import RootRouter from './routes'

// 👋 PWA REGISTER SCRIPT
import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true })

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RootRouter />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
