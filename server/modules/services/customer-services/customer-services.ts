import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../../common/response.server'
import {
  customerServiceIdSchema,
  listMyCustomerServicesSchema,
} from './customer-services.schemas'

export const getMyCustomerServices = createServerFn({ method: 'GET' })
  .validator(listMyCustomerServicesSchema)
  .handler(async ({ data }) => {
    const { listMyCustomerServices } = await import(
      './customer-services.service.server'
    )
    return createSuccessResponse(await listMyCustomerServices(data))
  })

export const getMyCustomerService = createServerFn({ method: 'GET' })
  .validator(customerServiceIdSchema)
  .handler(async ({ data }) => {
    const { getMyCustomerService: getService } = await import(
      './customer-services.service.server'
    )
    return createSuccessResponse(await getService(data.id))
  })
