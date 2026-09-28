import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  customerOrderService,
  type CustomerOrderFilters,
} from '../services/customerOrderService'

export const customerOrderKeys = {
  all: ['customer', 'orders'] as const,
  list: (filters: CustomerOrderFilters) =>
    [...customerOrderKeys.all, 'list', filters] as const,
}

export function useCreateCustomerOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: customerOrderService.create,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['customer', 'cart'] }),
        queryClient.invalidateQueries({ queryKey: customerOrderKeys.all }),
      ]),
  })
}

export function useCustomerOrders(filters: CustomerOrderFilters) {
  return useQuery({
    queryKey: customerOrderKeys.list(filters),
    queryFn: () => customerOrderService.list(filters),
    placeholderData: keepPreviousData,
  })
}

export function useCustomerOrder(id: string) {
  return useQuery({
    queryKey: ['customer', 'order', id],
    queryFn: () => customerOrderService.get(id),
  })
}
