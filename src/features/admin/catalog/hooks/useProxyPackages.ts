import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { proxyService } from '../services/proxyService'
import type { ListProxyPackagesInput } from '../../../../../server/modules/catalog/products/proxy.schemas'

export const proxyPackageKeys = {
  all: ['admin', 'catalog', 'proxy'] as const,
  list: (input: ListProxyPackagesInput) =>
    [...proxyPackageKeys.all, 'list', input] as const,
  detail: (id: string) => [...proxyPackageKeys.all, 'detail', id] as const,
}
export function useProxyPackages(input: ListProxyPackagesInput) {
  return useQuery({
    queryKey: proxyPackageKeys.list(input),
    queryFn: () => proxyService.list(input),
  })
}
export function useProxyPackage(id: string) {
  return useQuery({
    queryKey: proxyPackageKeys.detail(id),
    queryFn: () => proxyService.detail(id),
    enabled: Boolean(id),
  })
}
export function useCreateProxyPackage() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: proxyService.create,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: proxyPackageKeys.all }),
  })
}
export function useUpdateProxyPackage() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: proxyService.update,
    onSuccess: (_result, input) => {
      void client.invalidateQueries({ queryKey: proxyPackageKeys.all })
      void client.invalidateQueries({
        queryKey: proxyPackageKeys.detail(input.id),
      })
    },
  })
}
