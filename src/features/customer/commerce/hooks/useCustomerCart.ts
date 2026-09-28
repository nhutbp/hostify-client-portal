import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { customerCartService } from '../services/customerCartService'

const cartKey = ['customer', 'cart'] as const

export function useCustomerCart() {
  return useQuery({ queryKey: cartKey, queryFn: customerCartService.get })
}

export function useAddCustomerCartItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: customerCartService.add,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKey }),
  })
}

export function useRemoveCustomerCartItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: customerCartService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKey }),
  })
}

function useCartMutation<T>(mutationFn: (input: T) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKey }),
  })
}

export const useUpdateCustomerCartItem = () =>
  useCartMutation(customerCartService.update)
export const useClearCustomerCart = () =>
  useCartMutation(customerCartService.clear)
export const useApplyCustomerCoupon = () =>
  useCartMutation(customerCartService.applyCoupon)
export const useRemoveCustomerCoupon = () =>
  useCartMutation(customerCartService.removeCoupon)
