import { getAdminOrders } from '../../../../../server/modules/commerce/orders/admin-orders'
import type { ListAdminOrdersInput } from '../../../../../server/modules/commerce/orders/admin-orders.schemas'
import { unwrapSuccessResponse } from '@/utils/response'

export type AdminOrderFilters = ListAdminOrdersInput
export const adminOrderService = {
  list: (filters: AdminOrderFilters) =>
    getAdminOrders({ data: filters }).then(unwrapSuccessResponse),
}
