import {
  listProviderCategories,
  createProviderCategory,
  updateProviderCategory,
  deleteProviderCategory,
} from '../../../../../server/modules/catalog/products/provider-categories'
import type {
  CreateProviderCategoryInput,
  ListProviderCategoriesInput,
  UpdateProviderCategoryInput,
} from '../../../../../server/modules/catalog/products/provider-categories.schemas'
import { unwrapSuccessResponse } from '@/utils/response'

export type ProviderCategory = Awaited<
  ReturnType<typeof providerCategoryService.list>
>[number]
export const providerCategoryService = {
  list: (input: ListProviderCategoriesInput) =>
    listProviderCategories({ data: input }).then(unwrapSuccessResponse),
  create: (input: CreateProviderCategoryInput) =>
    createProviderCategory({ data: input }).then(unwrapSuccessResponse),
  update: (input: UpdateProviderCategoryInput) =>
    updateProviderCategory({ data: input }).then(unwrapSuccessResponse),
  delete: (id: string) =>
    deleteProviderCategory({ data: { id } }).then(unwrapSuccessResponse),
}
