import { Prisma } from '../../../../prisma/generated/client.js'
import { requirePermission } from '../../../common/auth-context.server'
import { createAppError } from '../../../common/app-error.server'
import {
  createVpsPackageRecord,
  getVpsPackageRecord,
  listVpsCatalogLookups,
  listVpsPackageRecords,
  setVpsPackageStatusRecord,
  updateVpsPackageRecord,
} from './vps.repository.server'
import type {
  CreateVpsPackageInput,
  GetVpsPackageInput,
  ListVpsPackagesInput,
  SetVpsPackageStatusInput,
  UpdateVpsPackageInput,
} from './vps.schemas'

function makeCode(name: string, requested?: string) {
  const value =
    requested ??
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toUpperCase()
  return `VPS-${value || Date.now()}`.slice(0, 60)
}

function handleUniqueProductError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    const target = error.meta?.target
    const isSlug = Array.isArray(target)
      ? target.includes('slug')
      : String(target).includes('slug')
    throw createAppError({
      message: isSlug ? 'Slug gói VPS đã tồn tại' : 'Mã gói VPS đã tồn tại',
      errorCode: isSlug ? 'CATALOG_VPS_SLUG_EXISTS' : 'CATALOG_VPS_CODE_EXISTS',
      statusCode: 409,
    })
  }
  throw error
}

export async function getVpsPackageLookups() {
  await requirePermission('catalog.product.view')
  return listVpsCatalogLookups()
}

export async function listVpsPackages(input: ListVpsPackagesInput) {
  await requirePermission('catalog.product.view')
  return listVpsPackageRecords(input)
}

export async function getVpsPackage(input: GetVpsPackageInput) {
  await requirePermission('catalog.product.view')
  const product = await getVpsPackageRecord(input.id)
  if (!product)
    throw createAppError({
      message: 'Không tìm thấy gói VPS',
      errorCode: 'CATALOG_VPS_NOT_FOUND',
      statusCode: 404,
    })
  return product
}

export async function setVpsPackageStatus(input: SetVpsPackageStatusInput) {
  await requirePermission('catalog.product.update')
  const result = await setVpsPackageStatusRecord(input)
  if (!result)
    throw createAppError({
      message: 'Không tìm thấy gói VPS',
      errorCode: 'CATALOG_VPS_NOT_FOUND',
      statusCode: 404,
    })
  return result
}

export async function createVpsPackage(input: CreateVpsPackageInput) {
  await requirePermission('catalog.product.create')
  try {
    return await createVpsPackageRecord(input, makeCode(input.name, input.code))
  } catch (error) {
    handleUniqueProductError(error)
  }
}

export async function updateVpsPackage(input: UpdateVpsPackageInput) {
  await requirePermission('catalog.product.update')
  let result
  try {
    result = await updateVpsPackageRecord(input)
  } catch (error) {
    handleUniqueProductError(error)
  }
  if (!result)
    throw createAppError({
      message: 'Không tìm thấy gói VPS',
      errorCode: 'CATALOG_VPS_NOT_FOUND',
      statusCode: 404,
    })
  return result
}
