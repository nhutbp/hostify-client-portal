import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../../common/response.server'
import { listCustomerPackagesSchema } from './customer-catalog.schemas'

export const listCustomerCategories = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { listCustomerCategories: list } =
      await import('./customer-catalog.service.server')
    return createSuccessResponse(await list())
  },
)

export const listCustomerPackages = createServerFn({ method: 'GET' })
  .validator(listCustomerPackagesSchema)
  .handler(async ({ data }) => {
    const { listCustomerPackages: list } =
      await import('./customer-catalog.service.server')
    return createSuccessResponse(await list(data.category))
  })
