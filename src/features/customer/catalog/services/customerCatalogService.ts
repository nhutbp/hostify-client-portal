import {
  listCustomerCategories,
  listCustomerPackages,
} from '../../../../../server/modules/catalog/products/customer-catalog'
import { unwrapSuccessResponse } from '@/utils/response'

export const customerCatalogService = {
  categories: async () => unwrapSuccessResponse(await listCustomerCategories()),
  packages: async (category: string) =>
    unwrapSuccessResponse(await listCustomerPackages({ data: { category } })),
}
