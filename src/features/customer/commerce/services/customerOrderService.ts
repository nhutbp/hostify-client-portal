import {
  createPendingOrder,
  getCustomerOrder,
  listCustomerOrders,
} from '../../../../../server/modules/commerce/orders/customer-orders'
import { unwrapSuccessResponse } from '@/utils/response'

export type CustomerOrderFilters = {
  search?: string
  status?:
    | 'DRAFT'
    | 'PENDING_PAYMENT'
    | 'PAID'
    | 'PROVISIONING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED'
    | 'REFUNDED'
  sort: 'NEWEST' | 'OLDEST'
  page: number
  limit: number
}

export const customerOrderService = {
  create: async (input: {
    idempotencyKey: string
    paymentMethod: 'WALLET' | 'MOMO' | 'VIETQR' | 'CARD' | 'USDT_TRC20'
    customerNote?: string
    termsAccepted: true
    configurations: {
      cartItemId: string
      operatingSystem?: string
      hostname?: string
    }[]
  }) => unwrapSuccessResponse(await createPendingOrder({ data: input })),
  get: async (id: string) =>
    unwrapSuccessResponse(await getCustomerOrder({ data: { id } })),
  list: async (filters: CustomerOrderFilters) =>
    unwrapSuccessResponse(await listCustomerOrders({ data: filters })),
}
