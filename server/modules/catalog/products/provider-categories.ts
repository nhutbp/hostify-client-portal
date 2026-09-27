import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../../common/response.server'
import {
  createProviderCategorySchema,
  deleteProviderCategorySchema,
  listProviderCategoriesSchema,
  updateProviderCategorySchema,
} from './provider-categories.schemas'

export const listProviderCategories = createServerFn({ method: 'GET' })
  .validator(listProviderCategoriesSchema)
  .handler(async ({ data }) => {
    const service = await import('./provider-categories.service.server')
    return createSuccessResponse(await service.listProviderCategories(data))
  })

export const createProviderCategory = createServerFn({ method: 'POST' })
  .validator(createProviderCategorySchema)
  .handler(async ({ data }) => {
    const service = await import('./provider-categories.service.server')
    return createSuccessResponse(await service.createProviderCategory(data))
  })

export const updateProviderCategory = createServerFn({ method: 'POST' })
  .validator(updateProviderCategorySchema)
  .handler(async ({ data }) => {
    const service = await import('./provider-categories.service.server')
    return createSuccessResponse(await service.updateProviderCategory(data))
  })

export const deleteProviderCategory = createServerFn({ method: 'POST' })
  .validator(deleteProviderCategorySchema)
  .handler(async ({ data }) => {
    const service = await import('./provider-categories.service.server')
    return createSuccessResponse(await service.deleteProviderCategory(data.id))
  })
