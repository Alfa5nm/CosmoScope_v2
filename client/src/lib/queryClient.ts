import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect by default (can be overridden per query)
      refetchOnReconnect: 'always'
    },
    mutations: {
      // Retry mutations once
      retry: 1
    }
  }
})

// Query keys for consistent caching
export const queryKeys = {
  // NASA API queries
  nasa: {
    all: ['nasa'] as const,
    tiles: (planet: string, layer: string, date?: string) => 
      ['nasa', 'tiles', planet, layer, date] as const,
    layers: (planet: string) => 
      ['nasa', 'layers', planet] as const,
    timeRanges: (planet: string, layer: string) => 
      ['nasa', 'timeRanges', planet, layer] as const
  },
  
  // User data queries
  user: {
    all: ['user'] as const,
    labels: (planet?: string) => 
      ['user', 'labels', planet] as const,
    checkpoints: () => 
      ['user', 'checkpoints'] as const
  },
  
  // Configuration queries
  config: {
    all: ['config'] as const,
    server: () => 
      ['config', 'server'] as const,
    layers: () => 
      ['config', 'layers'] as const
  }
} as const
