import { Prisma } from '../../../../prisma/generated/client.js'
import { requirePermission } from '../../../common/auth-context.server'
import { createAppError } from '../../../common/app-error.server'
import {
  createProxyPackageRecord,
  getProxyPackageRecord,
  getProxyCreationReferences,
  listProxyPackageRecords,
  updateProxyPackageRecord,
} from './proxy.repository.server'
import type {
  CreateProxyPackageInput,
  GetProxyPackageInput,
  ListProxyPackagesInput,
  UpdateProxyPackageInput,
} from './proxy.schemas'

function handleUniqueError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  )
    throw createAppError({
      message: 'Slug gói Proxy đã tồn tại',
      errorCode: 'CATALOG_PROXY_SLUG_EXISTS',
      statusCode: 409,
    })
  throw error
}

export async function listProxyPackages(input: ListProxyPackagesInput) {
  await requirePermission('catalog.product.view')
  return listProxyPackageRecords(input)
}

export async function createProxyPackage(input: CreateProxyPackageInput) {
  await requirePermission('catalog.product.create')
  const [category, provider] = await getProxyCreationReferences(
    input.providerCategoryId,
  )
  if (!category)
    throw createAppError({
      message: 'Chưa có danh mục Proxy',
      errorCode: 'CATALOG_PROXY_CATEGORY_NOT_FOUND',
      statusCode: 422,
    })
  if (!provider)
    throw createAppError({
      message: 'Nhà cung cấp không hợp lệ',
      errorCode: 'CATALOG_PROXY_PROVIDER_INVALID',
      statusCode: 422,
    })
  try {
    return await createProxyPackageRecord(input, category.id)
  } catch (error) {
    handleUniqueError(error)
  }
}

export async function getProxyPackage(input: GetProxyPackageInput) {
  await requirePermission('catalog.product.view')
  const product = await getProxyPackageRecord(input.id)
  if (!product)
    throw createAppError({
      message: 'Không tìm thấy gói Proxy',
      errorCode: 'CATALOG_PROXY_NOT_FOUND',
      statusCode: 404,
    })
  return product
}

export async function updateProxyPackage(input: UpdateProxyPackageInput) {
  await requirePermission('catalog.product.update')
  const [, provider] = await getProxyCreationReferences(
    input.providerCategoryId,
  )
  if (!provider)
    throw createAppError({
      message: 'Nhà cung cấp không hợp lệ',
      errorCode: 'CATALOG_PROXY_PROVIDER_INVALID',
      statusCode: 422,
    })
  let result
  try {
    result = await updateProxyPackageRecord(input)
  } catch (error) {
    handleUniqueError(error)
  }
  if (!result)
    throw createAppError({
      message: 'Không tìm thấy gói Proxy',
      errorCode: 'CATALOG_PROXY_NOT_FOUND',
      statusCode: 404,
    })
  return result
}
