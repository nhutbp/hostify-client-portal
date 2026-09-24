import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../../common/response.server'
import {
  catalogProductIdSchema,
  listCatalogProductsSchema,
} from './products.schemas'

export const getCatalogProducts = createServerFn({ method: 'GET' })
  .validator(listCatalogProductsSchema)
  .handler(async ({ data }) => {
    const { listCatalogProducts } = await import('./products.service.server')
    return createSuccessResponse(await listCatalogProducts(data))
  })

export const getCatalogProduct = createServerFn({ method: 'GET' })
  .validator(catalogProductIdSchema)
  .handler(async ({ data }) => {
    const { getCatalogProduct: getProduct } = await import(
      './products.service.server'
    )
    return createSuccessResponse(await getProduct(data.id))
  })
