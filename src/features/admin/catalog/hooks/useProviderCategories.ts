import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { providerCategoryService } from '../services/providerCategoryService'

export const providerCategoryKeys = {
  all: ['admin', 'catalog', 'provider-categories'] as const,
  list: (search: string) => [...providerCategoryKeys.all, search] as const,
}
export function useProviderCategories(search: string) {
  return useQuery({
    queryKey: providerCategoryKeys.list(search),
    queryFn: () => providerCategoryService.list({ search }),
    placeholderData: (previous) => previous,
  })
}
export function useCreateProviderCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: providerCategoryService.create,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: providerCategoryKeys.all }),
  })
}
export function useUpdateProviderCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: providerCategoryService.update,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: providerCategoryKeys.all }),
  })
}
export function useDeleteProviderCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: providerCategoryService.delete,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: providerCategoryKeys.all }),
  })
}
