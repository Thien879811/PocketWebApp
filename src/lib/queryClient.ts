import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once for network-related errors (default: 3)
      refetchOnWindowFocus: false, // Refetch when window is focused (useful for real-time dashboards)
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes (reduces unnecessary API calls)
      gcTime: 1000 * 60 * 60 * 24 // Cache persists for 24 hours (for offline mode compatibility)
    },
    mutations: {
      retry: false // Avoid automatic retries on mutation failures
    }
  }
})
