import { Prisma } from '../../../../prisma/generated/client.js'
import { requirePermission } from '../../../common/auth-context.server'
import { createAppError } from '../../../common/app-error.server'
import {
  createViaPackageRecord,
  getViaPackageRecord,
  getViaCreationReferences,
  listViaPackageRecords,
  updateViaPackageRecord,
} from './via.repository.server'
import type {
  CreateViaPackageInput,
  GetViaPackageInput,
  ListViaPackagesInput,
  UpdateViaPackageInput,
} from './via.schemas'

function handleUniqueError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  )
    throw createAppError({
      message: 'Slug gói VIA đã tồn tại',
      errorCode: 'CATALOG_VIA_SLUG_EXISTS',
      statusCode: 409,
    })
  throw error
}
export async function listViaPackages(input: ListViaPackagesInput) {
  await requirePermission('catalog.product.view')
  return listViaPackageRecords(input)
}
export async function createViaPackage(input: CreateViaPackageInput) {
  await requirePermission('catalog.product.create')
  const [category, provider] = await getViaCreationReferences(
    input.providerCategoryId,
  )
  if (!category)
    throw createAppError({
      message: 'Chưa có danh mục VIA',
      errorCode: 'CATALOG_VIA_CATEGORY_NOT_FOUND',
      statusCode: 422,
    })
  if (!provider)
    throw createAppError({
      message: 'Nhà cung cấp không hợp lệ',
      errorCode: 'CATALOG_VIA_PROVIDER_INVALID',
      statusCode: 422,
    })
  try {
    return await createViaPackageRecord(input, category.id)
  } catch (error) {
    handleUniqueError(error)
  }
}
export async function getViaPackage(input: GetViaPackageInput) {
  await requirePermission('catalog.product.view')
  const product = await getViaPackageRecord(input.id)
  if (!product)
    throw createAppError({
      message: 'Không tìm thấy gói VIA',
      errorCode: 'CATALOG_VIA_NOT_FOUND',
      statusCode: 404,
    })
  return product
}
export async function updateViaPackage(input: UpdateViaPackageInput) {
  await requirePermission('catalog.product.update')
  const [, provider] = await getViaCreationReferences(input.providerCategoryId)
  if (!provider)
    throw createAppError({
      message: 'Nhà cung cấp không hợp lệ',
      errorCode: 'CATALOG_VIA_PROVIDER_INVALID',
      statusCode: 422,
    })
  let result
  try {
    result = await updateViaPackageRecord(input)
  } catch (error) {
    handleUniqueError(error)
  }
  if (!result)
    throw createAppError({
      message: 'Không tìm thấy gói VIA',
      errorCode: 'CATALOG_VIA_NOT_FOUND',
      statusCode: 404,
    })
  return result
}
