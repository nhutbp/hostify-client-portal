import {
  getAdminOrderFilterOptions,
  getAdminOrderById,
  getAdminOrders,
  updateAdminOrder,
} from '../../../../../server/modules/commerce/orders/admin-orders'
import type {
  ListAdminOrdersInput,
  UpdateAdminOrderInput,
} from '../../../../../server/modules/commerce/orders/admin-orders.schemas'
import { unwrapSuccessResponse } from '@/utils/response'

export type AdminOrderFilters = ListAdminOrdersInput
export const adminOrderService = {
  list: (filters: AdminOrderFilters) =>
    getAdminOrders({ data: filters }).then(unwrapSuccessResponse),
  options: () => getAdminOrderFilterOptions().then(unwrapSuccessResponse),
  detail: (id: string) =>
    getAdminOrderById({ data: { id } }).then(unwrapSuccessResponse),
  update: (input: UpdateAdminOrderInput) =>
    updateAdminOrder({ data: input }).then(unwrapSuccessResponse),
}
