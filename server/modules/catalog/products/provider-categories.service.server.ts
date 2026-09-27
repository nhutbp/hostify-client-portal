import { Prisma } from '../../../../prisma/generated/client.js'
import { requirePermission } from '../../../common/auth-context.server'
import { createAppError } from '../../../common/app-error.server'
import {
  createProviderCategoryRecord,
  countProviderCategoryProducts,
  deleteProviderCategoryRecord,
  findProviderCategoryRecord,
  findProviderCategoryRootRecord,
  listProviderCategoryRecords,
  updateProviderCategoryRecord,
} from './provider-categories.repository.server'
import type {
  CreateProviderCategoryInput,
  ListProviderCategoriesInput,
  UpdateProviderCategoryInput,
} from './provider-categories.schemas'

function providerSlug(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function handleUniqueError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  )
    throw createAppError({
      message: 'Slug nhà cung cấp đã tồn tại',
      errorCode: 'CATALOG_PROVIDER_SLUG_EXISTS',
      statusCode: 409,
    })
  throw error
}

export async function listProviderCategories(
  input: ListProviderCategoriesInput,
) {
  await requirePermission('catalog.product.view')
  return listProviderCategoryRecords(input)
}

export async function createProviderCategory(
  input: CreateProviderCategoryInput,
) {
  await requirePermission('catalog.product.create')
  const root = await findProviderCategoryRootRecord()
  if (!root)
    throw createAppError({
      message: 'Chưa có danh mục cha Nhà cung cấp',
      errorCode: 'CATALOG_PROVIDER_ROOT_MISSING',
      statusCode: 500,
    })
  const slug = input.slug || providerSlug(input.name)
  if (!slug)
    throw createAppError({
      message: 'Slug không hợp lệ',
      errorCode: 'CATALOG_PROVIDER_INVALID_SLUG',
      statusCode: 400,
    })
  try {
    return await createProviderCategoryRecord({
      ...input,
      slug,
      rootId: root.id,
    })
  } catch (error) {
    handleUniqueError(error)
  }
}

export async function updateProviderCategory(
  input: UpdateProviderCategoryInput,
) {
  await requirePermission('catalog.product.update')
  const existing = await findProviderCategoryRecord(input.id)
  if (!existing)
    throw createAppError({
      message: 'Không tìm thấy nhà cung cấp',
      errorCode: 'CATALOG_PROVIDER_NOT_FOUND',
      statusCode: 404,
    })
  const root = await findProviderCategoryRootRecord()
  if (!root)
    throw createAppError({
      message: 'Chưa có danh mục cha Nhà cung cấp',
      errorCode: 'CATALOG_PROVIDER_ROOT_MISSING',
      statusCode: 500,
    })
  const slug = input.slug || providerSlug(input.name)
  if (!slug)
    throw createAppError({
      message: 'Slug không hợp lệ',
      errorCode: 'CATALOG_PROVIDER_INVALID_SLUG',
      statusCode: 400,
    })
  try {
    const updated = await updateProviderCategoryRecord({
      ...input,
      slug,
      rootId: root.id,
    })
    if (!updated)
      throw createAppError({
        message: 'Không tìm thấy nhà cung cấp',
        errorCode: 'CATALOG_PROVIDER_NOT_FOUND',
        statusCode: 404,
      })
    return updated
  } catch (error) {
    handleUniqueError(error)
  }
}

export async function deleteProviderCategory(id: string) {
  await requirePermission('catalog.product.delete')
  const existing = await findProviderCategoryRecord(id)
  if (!existing)
    throw createAppError({
      message: 'Không tìm thấy nhà cung cấp',
      errorCode: 'CATALOG_PROVIDER_NOT_FOUND',
      statusCode: 404,
    })
  const productCount = await countProviderCategoryProducts(id)
  if (productCount > 0)
    throw createAppError({
      message: 'Nhà cung cấp đang được gắn với sản phẩm',
      errorCode: 'CATALOG_PROVIDER_IN_USE',
      statusCode: 409,
    })
  const root = await findProviderCategoryRootRecord()
  if (!root)
    throw createAppError({
      message: 'Chưa có danh mục cha Nhà cung cấp',
      errorCode: 'CATALOG_PROVIDER_ROOT_MISSING',
      statusCode: 500,
    })
  const deleted = await deleteProviderCategoryRecord(id, root.id)
  if (!deleted)
    throw createAppError({
      message: 'Không tìm thấy nhà cung cấp',
      errorCode: 'CATALOG_PROVIDER_NOT_FOUND',
      statusCode: 404,
    })
  return deleted
}
