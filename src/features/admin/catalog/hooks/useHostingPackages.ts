import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { hostingService } from '../services/hostingService'
import type { ListHostingPackagesInput } from '../../../../../server/modules/catalog/products/hosting.schemas'

export const hostingPackageKeys = {
  all: ['admin', 'catalog', 'hosting'] as const,
  list: (input: ListHostingPackagesInput) =>
    [...hostingPackageKeys.all, 'list', input] as const,
  detail: (id: string) => [...hostingPackageKeys.all, 'detail', id] as const,
}

export function useHostingPackages(input: ListHostingPackagesInput) {
  return useQuery({
    queryKey: hostingPackageKeys.list(input),
    queryFn: () => hostingService.list(input),
  })
}

export function useCreateHostingPackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: hostingService.create,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: hostingPackageKeys.all }),
  })
}

export function useHostingPackage(id: string) {
  return useQuery({
    queryKey: hostingPackageKeys.detail(id),
    queryFn: () => hostingService.detail(id),
    enabled: Boolean(id),
  })
}

export function useUpdateHostingPackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: hostingService.update,
    onSuccess: (_result, input) => {
      queryClient.invalidateQueries({ queryKey: hostingPackageKeys.all })
      queryClient.invalidateQueries({
        queryKey: hostingPackageKeys.detail(input.id),
      })
    },
  })
}
