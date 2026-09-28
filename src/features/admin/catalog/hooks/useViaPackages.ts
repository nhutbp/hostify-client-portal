import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { viaService } from '../services/viaService'
import type { ListViaPackagesInput } from '../../../../../server/modules/catalog/products/via.schemas'
export const viaPackageKeys = {
  all: ['admin', 'catalog', 'via'] as const,
  list: (input: ListViaPackagesInput) =>
    [...viaPackageKeys.all, 'list', input] as const,
  detail: (id: string) => [...viaPackageKeys.all, 'detail', id] as const,
}
export function useViaPackages(input: ListViaPackagesInput) {
  return useQuery({
    queryKey: viaPackageKeys.list(input),
    queryFn: () => viaService.list(input),
  })
}
export function useViaPackage(id: string) {
  return useQuery({
    queryKey: viaPackageKeys.detail(id),
    queryFn: () => viaService.detail(id),
    enabled: Boolean(id),
  })
}
export function useCreateViaPackage() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: viaService.create,
    onSuccess: () => client.invalidateQueries({ queryKey: viaPackageKeys.all }),
  })
}
export function useUpdateViaPackage() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: viaService.update,
    onSuccess: (_result, input) => {
      void client.invalidateQueries({ queryKey: viaPackageKeys.all })
      void client.invalidateQueries({
        queryKey: viaPackageKeys.detail(input.id),
      })
    },
  })
}
