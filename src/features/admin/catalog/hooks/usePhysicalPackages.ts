import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { physicalService } from '../services/physicalService'
import type { ListPhysicalPackagesInput } from '../../../../../server/modules/catalog/products/physical.schemas'

export const physicalPackageKeys = {
  all: ['admin', 'catalog', 'physical'] as const,
  list: (input: ListPhysicalPackagesInput) =>
    [...physicalPackageKeys.all, 'list', input] as const,
  detail: (id: string) => [...physicalPackageKeys.all, 'detail', id] as const,
}

export function usePhysicalPackages(input: ListPhysicalPackagesInput) {
  return useQuery({
    queryKey: physicalPackageKeys.list(input),
    queryFn: () => physicalService.list(input),
  })
}

export function useCreatePhysicalPackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: physicalService.create,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: physicalPackageKeys.all }),
  })
}

export function usePhysicalPackage(id: string) {
  return useQuery({
    queryKey: physicalPackageKeys.detail(id),
    queryFn: () => physicalService.detail(id),
    enabled: Boolean(id),
  })
}

export function useUpdatePhysicalPackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: physicalService.update,
    onSuccess: (_result, input) => {
      queryClient.invalidateQueries({ queryKey: physicalPackageKeys.all })
      queryClient.invalidateQueries({
        queryKey: physicalPackageKeys.detail(input.id),
      })
    },
  })
}
