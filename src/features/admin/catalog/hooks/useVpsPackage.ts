import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { vpsService } from '../services/vpsService'
import type { ListVpsPackagesInput } from '../../../../../server/modules/catalog/products/vps.schemas'

export const vpsPackageKeys = { all: ['admin', 'catalog', 'vps'] as const, lookups: () => [...vpsPackageKeys.all, 'lookups'] as const, list: (input: ListVpsPackagesInput) => [...vpsPackageKeys.all, 'list', input] as const }

export function useVpsPackageLookups() {
  return useQuery({ queryKey: vpsPackageKeys.lookups(), queryFn: vpsService.lookups, staleTime: 5 * 60 * 1000 })
}

export function useCreateVpsPackage() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: vpsService.create, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'catalog'] }) })
}

export function useVpsPackages(input: ListVpsPackagesInput) {
  return useQuery({ queryKey: vpsPackageKeys.list(input), queryFn: () => vpsService.list(input) })
}

export function useSetVpsPackageStatus() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: vpsService.setStatus, onSuccess: () => queryClient.invalidateQueries({ queryKey: vpsPackageKeys.all }) })
}
