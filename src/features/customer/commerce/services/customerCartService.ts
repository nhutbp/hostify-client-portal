import {
  addCustomerCartItem,
  getCustomerCart,
  removeCustomerCartItem,
  updateCustomerCartItem,
  clearCustomerCart,
  applyCustomerCoupon,
  removeCustomerCoupon,
} from '../../../../../server/modules/commerce/carts/customer-cart'
import { unwrapSuccessResponse } from '@/utils/response'

export const customerCartService = {
  get: async () => unwrapSuccessResponse(await getCustomerCart()),
  add: async (input: {
    productId: string
    planId: string
    billingCycle: string
    datacenterId?: string
  }) => unwrapSuccessResponse(await addCustomerCartItem({ data: input })),
  remove: async (id: string) =>
    unwrapSuccessResponse(await removeCustomerCartItem({ data: { id } })),
  update: async (input: {
    id: string
    quantity: number
    billingCycle: string
    datacenterId?: string | null
    operatingSystem?: string
  }) => unwrapSuccessResponse(await updateCustomerCartItem({ data: input })),
  clear: async () => unwrapSuccessResponse(await clearCustomerCart()),
  applyCoupon: async (code: string) =>
    unwrapSuccessResponse(await applyCustomerCoupon({ data: { code } })),
  removeCoupon: async () => unwrapSuccessResponse(await removeCustomerCoupon()),
}
