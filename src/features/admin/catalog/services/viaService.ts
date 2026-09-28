import {
  createViaPackage,
  getViaPackage,
  listViaPackages,
  updateViaPackage,
} from '../../../../../server/modules/catalog/products/via'
import type {
  CreateViaPackageInput,
  ListViaPackagesInput,
  UpdateViaPackageInput,
} from '../../../../../server/modules/catalog/products/via.schemas'
import { unwrapSuccessResponse } from '@/utils/response'
export type ViaPackageList =
  Awaited<ReturnType<typeof listViaPackages>> extends { result: infer T }
    ? T
    : never
export type ViaPackageDetail =
  Awaited<ReturnType<typeof getViaPackage>> extends { result: infer T }
    ? T
    : never
export const viaService = {
  list: (input: ListViaPackagesInput) =>
    listViaPackages({ data: input }).then(unwrapSuccessResponse),
  create: (input: CreateViaPackageInput) =>
    createViaPackage({ data: input }).then(unwrapSuccessResponse),
  detail: (id: string) =>
    getViaPackage({ data: { id } }).then(unwrapSuccessResponse),
  update: (input: UpdateViaPackageInput) =>
    updateViaPackage({ data: input }).then(unwrapSuccessResponse),
}
