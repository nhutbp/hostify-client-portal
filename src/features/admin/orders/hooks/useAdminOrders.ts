import { useQuery } from '@tanstack/react-query'
import { adminOrderService } from '../services/adminOrderService'
import type { AdminOrderFilters } from '../services/adminOrderService'

export function useAdminOrders(filters: AdminOrderFilters) {
  return useQuery({
    queryKey: ['admin', 'orders', filters],
    queryFn: () => adminOrderService.list(filters),
    placeholderData: (previous) => previous,
  })
}
