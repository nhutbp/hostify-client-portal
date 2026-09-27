import { requirePermission } from '../../../common/auth-context.server'
import { createAppError } from '../../../common/app-error.server'
import { createVpsPackageRecord, listVpsCatalogLookups, listVpsPackageRecords, setVpsPackageStatusRecord } from './vps.repository.server'
import type { CreateVpsPackageInput, ListVpsPackagesInput, SetVpsPackageStatusInput } from './vps.schemas'

function makeCode(name: string, requested?: string) {
  const value = requested ?? name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toUpperCase()
  return `VPS-${value || Date.now()}`.slice(0, 60)
}

export async function getVpsPackageLookups() {
  await requirePermission('catalog.product.view')
  return listVpsCatalogLookups()
}

export async function listVpsPackages(input: ListVpsPackagesInput) {
  await requirePermission('catalog.product.view')
  return listVpsPackageRecords(input)
}

export async function setVpsPackageStatus(input: SetVpsPackageStatusInput) {
  await requirePermission('catalog.product.update')
  const result = await setVpsPackageStatusRecord(input)
  if (!result) throw createAppError({ message: 'Không tìm thấy gói VPS', errorCode: 'CATALOG_VPS_NOT_FOUND', statusCode: 404 })
  return result
}

export async function createVpsPackage(input: CreateVpsPackageInput) {
  await requirePermission('catalog.product.create')
  try {
    return await createVpsPackageRecord(input, makeCode(input.name, input.code))
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) throw createAppError({ message: 'Mã gói VPS đã tồn tại', errorCode: 'CATALOG_VPS_CODE_EXISTS', statusCode: 409 })
    throw error
  }
}
