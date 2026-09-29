import type { adminOrderService } from '../../services/adminOrderService'

export type AdminOrderDetail = Awaited<
  ReturnType<typeof adminOrderService.detail>
>
export type AdminOrderItem = AdminOrderDetail['items'][number]
