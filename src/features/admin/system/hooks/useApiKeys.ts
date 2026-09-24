import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiKeyService } from '../services/apiKeyService'

const apiKeyQueryKey = ['system', 'api-keys'] as const

export function useApiKeys() {
  return useQuery({
    queryKey: apiKeyQueryKey,
    queryFn: apiKeyService.list,
  })
}

export function useCreateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: apiKeyService.create,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKey }),
  })
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: apiKeyService.revoke,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKey }),
  })
}
