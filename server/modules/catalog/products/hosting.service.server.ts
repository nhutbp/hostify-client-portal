import { Prisma } from '../../../../prisma/generated/client.js'
import { requirePermission } from '../../../common/auth-context.server'
import { createAppError } from '../../../common/app-error.server'
import {
  createHostingPackageRecord,
  getHostingPackageRecord,
  getHostingCreationReferences,
  listHostingPackageRecords,
  updateHostingPackageRecord,
} from './hosting.repository.server'
import type {
  CreateHostingPackageInput,
  GetHostingPackageInput,
  ListHostingPackagesInput,
  UpdateHostingPackageInput,
} from './hosting.schemas'

function handleUniqueHostingError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    throw createAppError({
      message: 'Slug gói Hosting đã tồn tại',
      errorCode: 'CATALOG_HOSTING_SLUG_EXISTS',
      statusCode: 409,
    })
  }
  throw error
}

export async function listHostingPackages(input: ListHostingPackagesInput) {
  await requirePermission('catalog.product.view')
  return listHostingPackageRecords(input)
}

export async function createHostingPackage(input: CreateHostingPackageInput) {
  await requirePermission('catalog.product.create')
  const [category, provider] = await getHostingCreationReferences(
    input.providerCategoryId,
  )
  if (!category)
    throw createAppError({
      message: 'Chưa có danh mục Hosting',
      errorCode: 'CATALOG_HOSTING_CATEGORY_NOT_FOUND',
      statusCode: 422,
    })
  if (!provider)
    throw createAppError({
      message: 'Nhà cung cấp không hợp lệ',
      errorCode: 'CATALOG_HOSTING_PROVIDER_INVALID',
      statusCode: 422,
    })
  try {
    return await createHostingPackageRecord(input, category.id)
  } catch (error) {
    handleUniqueHostingError(error)
  }
}

export async function getHostingPackage(input: GetHostingPackageInput) {
  await requirePermission('catalog.product.view')
  const product = await getHostingPackageRecord(input.id)
  if (!product)
    throw createAppError({
      message: 'Không tìm thấy gói Hosting',
      errorCode: 'CATALOG_HOSTING_NOT_FOUND',
      statusCode: 404,
    })
  return product
}

export async function updateHostingPackage(input: UpdateHostingPackageInput) {
  await requirePermission('catalog.product.update')
  const [, provider] = await getHostingCreationReferences(
    input.providerCategoryId,
  )
  if (!provider)
    throw createAppError({
      message: 'Nhà cung cấp không hợp lệ',
      errorCode: 'CATALOG_HOSTING_PROVIDER_INVALID',
      statusCode: 422,
    })
  let result
  try {
    result = await updateHostingPackageRecord(input)
  } catch (error) {
    handleUniqueHostingError(error)
  }
  if (!result)
    throw createAppError({
      message: 'Không tìm thấy gói Hosting',
      errorCode: 'CATALOG_HOSTING_NOT_FOUND',
      statusCode: 404,
    })
  return result
}
