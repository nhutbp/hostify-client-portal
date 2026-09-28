import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../../common/response.server'
import { listAdminOrdersSchema } from './admin-orders.schemas'

export const getAdminOrders = createServerFn({ method: 'GET' })
  .validator(listAdminOrdersSchema)
  .handler(async ({ data }) => {
    const { listAdminOrders } = await import('./admin-orders.service.server')
    return createSuccessResponse(await listAdminOrders(data))
  })
