import {
  createHostingPackage,
  getHostingPackage,
  listHostingPackages,
  updateHostingPackage,
} from '../../../../../server/modules/catalog/products/hosting'
import type {
  CreateHostingPackageInput,
  ListHostingPackagesInput,
  UpdateHostingPackageInput,
} from '../../../../../server/modules/catalog/products/hosting.schemas'
import { unwrapSuccessResponse } from '@/utils/response'

export type HostingPackageList =
  Awaited<ReturnType<typeof listHostingPackages>> extends { result: infer T }
    ? T
    : never
export type HostingPackageDetail =
  Awaited<ReturnType<typeof getHostingPackage>> extends { result: infer T }
    ? T
    : never
export type { CreateHostingPackageInput } from '../../../../../server/modules/catalog/products/hosting.schemas'

export const hostingService = {
  list: (input: ListHostingPackagesInput) =>
    listHostingPackages({ data: input }).then(unwrapSuccessResponse),
  create: (input: CreateHostingPackageInput) =>
    createHostingPackage({ data: input }).then(unwrapSuccessResponse),
  detail: (id: string) =>
    getHostingPackage({ data: { id } }).then(unwrapSuccessResponse),
  update: (input: UpdateHostingPackageInput) =>
    updateHostingPackage({ data: input }).then(unwrapSuccessResponse),
}
