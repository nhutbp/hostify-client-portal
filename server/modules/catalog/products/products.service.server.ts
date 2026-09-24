import { createAppError } from '../../../common/app-error.server'
import {
  findCatalogProductRecord,
  listCatalogProductRecords,
} from './products.repository.server'
import type { ListCatalogProductsInput } from './products.schemas'

export function listCatalogProducts(input: ListCatalogProductsInput) {
  return listCatalogProductRecords(input)
}

export async function getCatalogProduct(id: string) {
  const product = await findCatalogProductRecord(id)
  if (!product) {
    throw createAppError({
      message: 'Không tìm thấy sản phẩm đang hoạt động',
      errorCode: 'CATALOG_PRODUCT_NOT_FOUND',
      statusCode: 404,
    })
  }
  return product
}
