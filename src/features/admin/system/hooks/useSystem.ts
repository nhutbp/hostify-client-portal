// System hooks - TanStack Query pattern
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { systemService } from '../services/systemService'
import type {
  SystemOptionsFilters,
  CreateOptionRequest,
  UpdateOptionRequest,
} from '../types/system'
import { useCurrentUserId } from '@/features/auth/store/authStore'
import { showApiError, showSuccess } from '@/utils/toast'

// Query keys - Hierarchical structure with userId for cache isolation
export const systemKeys = {
  all: (userId: string) => ['system', userId] as const,
  options: (userId: string) => [...systemKeys.all(userId), 'options'] as const,
  optionsList: (userId: string, filters?: SystemOptionsFilters) =>
    [...systemKeys.options(userId), 'list', filters] as const,
  optionDetail: (userId: string, key: string) =>
    [...systemKeys.options(userId), 'detail', key] as const,
}

/**
 * Hook to fetch paginated system options list
 */
export function useSystemOptions(filters: SystemOptionsFilters) {
  const userId = useCurrentUserId()

  return useQuery({
    queryKey: systemKeys.optionsList(userId ?? '', filters),
    queryFn: () => systemService.getOptions(filters),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch single option by key
 */
export function useSystemOption(key: string | null) {
  const userId = useCurrentUserId()

  return useQuery({
    queryKey: systemKeys.optionDetail(userId ?? '', key ?? ''),
    queryFn: () => systemService.getOption(key!),
    enabled: !!key && !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to create a new option
 */
export function useCreateOption() {
  const queryClient = useQueryClient()
  const userId = useCurrentUserId()

  return useMutation({
    mutationFn: (request: CreateOptionRequest) =>
      systemService.createOption(request),
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: systemKeys.options(userId) })
      }
      showSuccess('Option created successfully')
    },
    onError: (error: Error) => {
      showApiError(error, 'Failed to create option')
    },
  })
}

/**
 * Hook to update an existing option
 */
export function useUpdateOption() {
  const queryClient = useQueryClient()
  const userId = useCurrentUserId()

  return useMutation({
    mutationFn: ({
      key,
      updates,
    }: {
      key: string
      updates: UpdateOptionRequest
    }) => systemService.updateOption(key, updates),
    onSuccess: (_data, variables) => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: systemKeys.optionDetail(userId, variables.key),
        })
        queryClient.invalidateQueries({ queryKey: systemKeys.options(userId) })
      }
      showSuccess('Option updated successfully')
    },
    onError: (error: Error) => {
      showApiError(error, 'Failed to update option')
    },
  })
}

/**
 * Hook to delete an option
 */
export function useDeleteOption() {
  const queryClient = useQueryClient()
  const userId = useCurrentUserId()

  return useMutation({
    mutationFn: (key: string) => systemService.deleteOption(key),
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: systemKeys.options(userId) })
      }
      showSuccess('Option deleted successfully')
    },
    onError: (error: Error) => {
      showApiError(error, 'Failed to delete option')
    },
  })
}
