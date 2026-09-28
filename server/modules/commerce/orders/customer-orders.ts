import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../../common/response.server'
import {
  createPendingOrderSchema,
  getCustomerOrderSchema,
  listCustomerOrdersSchema,
} from './customer-orders.schemas'

export const createPendingOrder = createServerFn({ method: 'POST' })
  .validator(createPendingOrderSchema)
  .handler(async ({ data }) => {
    const service = await import('./customer-orders.service.server')
    return createSuccessResponse(
      await service.createPendingOrder(data),
      'Đã ghi nhận đơn hàng chờ thanh toán',
    )
  })

export const getCustomerOrder = createServerFn({ method: 'GET' })
  .validator(getCustomerOrderSchema)
  .handler(async ({ data }) => {
    const service = await import('./customer-orders.service.server')
    return createSuccessResponse(await service.getCustomerOrder(data.id))
  })

export const listCustomerOrders = createServerFn({ method: 'GET' })
  .validator(listCustomerOrdersSchema)
  .handler(async ({ data }) => {
    const service = await import('./customer-orders.service.server')
    return createSuccessResponse(await service.listCustomerOrders(data))
  })
