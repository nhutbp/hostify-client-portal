import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../../common/response.server'
import {
  getAdminOrderSchema,
  listAdminOrdersSchema,
  updateAdminOrderSchema,
} from './admin-orders.schemas'

export const getAdminOrders = createServerFn({ method: 'GET' })
  .validator(listAdminOrdersSchema)
  .handler(async ({ data }) => {
    const { listAdminOrders } = await import('./admin-orders.service.server')
    return createSuccessResponse(await listAdminOrders(data))
  })

export const getAdminOrderFilterOptions = createServerFn({
  method: 'GET',
}).handler(async () => {
  const { getAdminOrderOptions } = await import('./admin-orders.service.server')
  return createSuccessResponse(await getAdminOrderOptions())
})

export const getAdminOrderById = createServerFn({ method: 'GET' })
  .validator(getAdminOrderSchema)
  .handler(async ({ data }) => {
    const { getAdminOrderDetail } =
      await import('./admin-orders.service.server')
    return createSuccessResponse(await getAdminOrderDetail(data.id))
  })

export const updateAdminOrder = createServerFn({ method: 'POST' })
  .validator(updateAdminOrderSchema)
  .handler(async ({ data }) => {
    const { updateAdminOrderDetails } =
      await import('./admin-orders.service.server')
    return createSuccessResponse(await updateAdminOrderDetails(data))
  })
