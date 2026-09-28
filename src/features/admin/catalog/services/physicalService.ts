import {
  createPhysicalPackage,
  getPhysicalPackage,
  listPhysicalPackages,
  updatePhysicalPackage,
} from '../../../../../server/modules/catalog/products/physical'
import type {
  CreatePhysicalPackageInput,
  ListPhysicalPackagesInput,
  UpdatePhysicalPackageInput,
} from '../../../../../server/modules/catalog/products/physical.schemas'
import { unwrapSuccessResponse } from '@/utils/response'

export type PhysicalPackageList =
  Awaited<ReturnType<typeof listPhysicalPackages>> extends { result: infer T }
    ? T
    : never
export type PhysicalPackageDetail =
  Awaited<ReturnType<typeof getPhysicalPackage>> extends { result: infer T }
    ? T
    : never
export type { CreatePhysicalPackageInput } from '../../../../../server/modules/catalog/products/physical.schemas'

export const physicalService = {
  list: (input: ListPhysicalPackagesInput) =>
    listPhysicalPackages({ data: input }).then(unwrapSuccessResponse),
  create: (input: CreatePhysicalPackageInput) =>
    createPhysicalPackage({ data: input }).then(unwrapSuccessResponse),
  detail: (id: string) =>
    getPhysicalPackage({ data: { id } }).then(unwrapSuccessResponse),
  update: (input: UpdatePhysicalPackageInput) =>
    updatePhysicalPackage({ data: input }).then(unwrapSuccessResponse),
}
