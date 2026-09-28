import { Prisma } from '../../../../prisma/generated/client.js'
import { requirePermission } from '../../../common/auth-context.server'
import { createAppError } from '../../../common/app-error.server'
import {
  createPhysicalPackageRecord,
  getPhysicalPackageRecord,
  getPhysicalCreationReferences,
  listPhysicalPackageRecords,
  updatePhysicalPackageRecord,
} from './physical.repository.server'
import type {
  CreatePhysicalPackageInput,
  GetPhysicalPackageInput,
  ListPhysicalPackagesInput,
  UpdatePhysicalPackageInput,
} from './physical.schemas'

function handleUniquePhysicalError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    throw createAppError({
      message: 'Slug gói Máy chủ vật lý đã tồn tại',
      errorCode: 'CATALOG_PHYSICAL_SLUG_EXISTS',
      statusCode: 409,
    })
  }
  throw error
}

export async function listPhysicalPackages(input: ListPhysicalPackagesInput) {
  await requirePermission('catalog.product.view')
  return listPhysicalPackageRecords(input)
}

export async function createPhysicalPackage(input: CreatePhysicalPackageInput) {
  await requirePermission('catalog.product.create')
  const [category, provider] = await getPhysicalCreationReferences(
    input.providerCategoryId,
  )
  if (!category)
    throw createAppError({
      message: 'Chưa có danh mục Máy chủ vật lý',
      errorCode: 'CATALOG_PHYSICAL_CATEGORY_NOT_FOUND',
      statusCode: 422,
    })
  if (!provider)
    throw createAppError({
      message: 'Nhà cung cấp không hợp lệ',
      errorCode: 'CATALOG_PHYSICAL_PROVIDER_INVALID',
      statusCode: 422,
    })
  try {
    return await createPhysicalPackageRecord(input, category.id)
  } catch (error) {
    handleUniquePhysicalError(error)
  }
}

export async function getPhysicalPackage(input: GetPhysicalPackageInput) {
  await requirePermission('catalog.product.view')
  const product = await getPhysicalPackageRecord(input.id)
  if (!product)
    throw createAppError({
      message: 'Không tìm thấy gói Máy chủ vật lý',
      errorCode: 'CATALOG_PHYSICAL_NOT_FOUND',
      statusCode: 404,
    })
  return product
}

export async function updatePhysicalPackage(input: UpdatePhysicalPackageInput) {
  await requirePermission('catalog.product.update')
  const [, provider] = await getPhysicalCreationReferences(
    input.providerCategoryId,
  )
  if (!provider)
    throw createAppError({
      message: 'Nhà cung cấp không hợp lệ',
      errorCode: 'CATALOG_PHYSICAL_PROVIDER_INVALID',
      statusCode: 422,
    })
  let result
  try {
    result = await updatePhysicalPackageRecord(input)
  } catch (error) {
    handleUniquePhysicalError(error)
  }
  if (!result)
    throw createAppError({
      message: 'Không tìm thấy gói Máy chủ vật lý',
      errorCode: 'CATALOG_PHYSICAL_NOT_FOUND',
      statusCode: 404,
    })
  return result
}
