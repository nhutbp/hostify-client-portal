import {
  createVpsPackage,
  getVpsPackage,
  getVpsPackageLookups,
  listVpsPackages,
  setVpsPackageStatus,
  updateVpsPackage,
} from '../../../../../server/modules/catalog/products/vps'
import type {
  CreateVpsPackageInput,
  ListVpsPackagesInput,
  SetVpsPackageStatusInput,
  UpdateVpsPackageInput,
} from '../../../../../server/modules/catalog/products/vps.schemas'
import { unwrapSuccessResponse } from '@/utils/response'

export type {
  CreateVpsPackageInput,
  UpdateVpsPackageInput,
} from '../../../../../server/modules/catalog/products/vps.schemas'
export type VpsLookups =
  Awaited<ReturnType<typeof getVpsPackageLookups>> extends { result: infer T }
    ? T
    : never
export type VpsPackageList =
  Awaited<ReturnType<typeof listVpsPackages>> extends { result: infer T }
    ? T
    : never
export type VpsPackageDetail =
  Awaited<ReturnType<typeof getVpsPackage>> extends { result: infer T }
    ? T
    : never

export const vpsService = {
  lookups: () => getVpsPackageLookups({ data: {} }).then(unwrapSuccessResponse),
  create: (input: CreateVpsPackageInput) =>
    createVpsPackage({ data: input }).then(unwrapSuccessResponse),
  update: (input: UpdateVpsPackageInput) =>
    updateVpsPackage({ data: input }).then(unwrapSuccessResponse),
  list: (input: ListVpsPackagesInput) =>
    listVpsPackages({ data: input }).then(unwrapSuccessResponse),
  detail: (id: string) =>
    getVpsPackage({ data: { id } }).then(unwrapSuccessResponse),
  setStatus: (input: SetVpsPackageStatusInput) =>
    setVpsPackageStatus({ data: input }).then(unwrapSuccessResponse),
}
