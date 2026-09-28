import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  customerServicesService,
  type CustomerServicesFilters,
} from '../services/customerServicesService'

export const customerServicesKeys = {
  all: ['customer', 'services'] as const,
  list: (filters: CustomerServicesFilters) =>
    [...customerServicesKeys.all, 'list', filters] as const,
  detail: (id: string) => [...customerServicesKeys.all, 'detail', id] as const,
}

export function useCustomerServices(filters: CustomerServicesFilters) {
  return useQuery({
    queryKey: customerServicesKeys.list(filters),
    queryFn: () => customerServicesService.list(filters),
    placeholderData: keepPreviousData,
  })
}

export function useCustomerService(id: string) {
  return useQuery({
    queryKey: customerServicesKeys.detail(id),
    queryFn: () => customerServicesService.detail(id),
    enabled: Boolean(id),
  })
}
