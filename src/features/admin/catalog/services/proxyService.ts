import {
  createProxyPackage,
  getProxyPackage,
  listProxyPackages,
  updateProxyPackage,
} from '../../../../../server/modules/catalog/products/proxy'
import type {
  CreateProxyPackageInput,
  ListProxyPackagesInput,
  UpdateProxyPackageInput,
} from '../../../../../server/modules/catalog/products/proxy.schemas'
import { unwrapSuccessResponse } from '@/utils/response'

export type ProxyPackageList =
  Awaited<ReturnType<typeof listProxyPackages>> extends { result: infer T }
    ? T
    : never
export type ProxyPackageDetail =
  Awaited<ReturnType<typeof getProxyPackage>> extends { result: infer T }
    ? T
    : never
export type { CreateProxyPackageInput } from '../../../../../server/modules/catalog/products/proxy.schemas'

export const proxyService = {
  list: (input: ListProxyPackagesInput) =>
    listProxyPackages({ data: input }).then(unwrapSuccessResponse),
  create: (input: CreateProxyPackageInput) =>
    createProxyPackage({ data: input }).then(unwrapSuccessResponse),
  detail: (id: string) =>
    getProxyPackage({ data: { id } }).then(unwrapSuccessResponse),
  update: (input: UpdateProxyPackageInput) =>
    updateProxyPackage({ data: input }).then(unwrapSuccessResponse),
}
