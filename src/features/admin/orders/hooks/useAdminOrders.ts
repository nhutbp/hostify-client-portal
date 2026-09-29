import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminOrderService } from '../services/adminOrderService'
import type { AdminOrderFilters } from '../services/adminOrderService'

export function useAdminOrders(filters: AdminOrderFilters) {
  return useQuery({
    queryKey: ['admin', 'orders', filters],
    queryFn: () => adminOrderService.list(filters),
    placeholderData: (previous) => previous,
    staleTime: 15_000,
  })
}

export function useAdminOrderOptions() {
  return useQuery({
    queryKey: ['admin', 'order-filter-options'],
    queryFn: adminOrderService.options,
    staleTime: 60_000,
  })
}

export function useAdminOrderDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'orders', 'detail', id],
    queryFn: () => adminOrderService.detail(id),
    enabled: Boolean(id),
  })
}

export function useUpdateAdminOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminOrderService.update,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'order-filter-options'],
      })
      void queryClient.invalidateQueries({ queryKey: ['customer', 'services'] })
      void queryClient.invalidateQueries({ queryKey: ['customer', 'orders'] })
    },
  })
}
