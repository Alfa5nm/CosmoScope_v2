import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queryClient'

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Generic fetch wrapper with error handling
const apiFetch = async (url: string, options?: RequestInit) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

// NASA API hooks
export const useNasaLayers = (planet: string) => {
  return useQuery({
    queryKey: queryKeys.nasa.layers(planet),
    queryFn: () => apiFetch(`/api/config`),
    enabled: !!planet,
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    select: (data) => data.supportedLayers?.[planet] || []
  })
}

export const useNasaTimeRanges = (planet: string, layer: string) => {
  return useQuery({
    queryKey: queryKeys.nasa.timeRanges(planet, layer),
    queryFn: () => apiFetch(`/api/config`),
    enabled: !!planet && !!layer,
    staleTime: 30 * 60 * 1000,
    select: (data) => data.timeRanges?.[planet] || null
  })
}

// User data hooks
export const useUserLabels = (planet?: string) => {
  return useQuery({
    queryKey: queryKeys.user.labels(planet),
    queryFn: () => apiFetch(`/api/labels${planet ? `?planet=${planet}` : ''}`),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    select: (data) => data.labels || []
  })
}

export const useUserCheckpoints = () => {
  return useQuery({
    queryKey: queryKeys.user.checkpoints(),
    queryFn: () => apiFetch('/api/user/checkpoints'),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    select: (data) => data.checkpoints || []
  })
}

// Mutations
export const useCreateLabel = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (labelData: any) => 
      apiFetch('/api/labels', {
        method: 'POST',
        body: JSON.stringify(labelData)
      }),
    onSuccess: (_, variables) => {
      // Invalidate and refetch labels
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.labels(variables.planet) 
      })
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.labels() 
      })
    }
  })
}

export const useDeleteLabel = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (labelId: string) => 
      apiFetch(`/api/labels/${labelId}`, {
        method: 'DELETE'
      }),
    onSuccess: (_, labelId) => {
      // Optimistically update the cache
      queryClient.setQueriesData(
        { queryKey: queryKeys.user.labels() },
        (oldData: any) => {
          if (!oldData) return oldData
          return oldData.filter((label: any) => label.id !== labelId)
        }
      )
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.labels() 
      })
    }
  })
}

export const useUpdateCheckpoint = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (checkpointData: any) => 
      apiFetch('/api/user/checkpoints', {
        method: 'POST',
        body: JSON.stringify(checkpointData)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.checkpoints() 
      })
    }
  })
}

// Server configuration hook
export const useServerConfig = () => {
  return useQuery({
    queryKey: queryKeys.config.server(),
    queryFn: () => apiFetch('/api/config'),
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
    retry: 1 // Only retry once for config
  })
}

// Health check hook
export const useServerHealth = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiFetch('/api/health'),
    refetchInterval: 30 * 1000, // Check every 30 seconds
    staleTime: 10 * 1000, // Consider stale after 10 seconds
    retry: 1
  })
}
