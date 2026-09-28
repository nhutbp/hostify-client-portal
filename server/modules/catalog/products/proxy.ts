import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../../common/response.server'
import {
  createProxyPackageSchema,
  getProxyPackageSchema,
  listProxyPackagesSchema,
  updateProxyPackageSchema,
} from './proxy.schemas'

export const listProxyPackages = createServerFn({ method: 'GET' })
  .validator(listProxyPackagesSchema)
  .handler(async ({ data }) => {
    const { listProxyPackages: list } = await import('./proxy.service.server')
    return createSuccessResponse(await list(data))
  })
export const createProxyPackage = createServerFn({ method: 'POST' })
  .validator(createProxyPackageSchema)
  .handler(async ({ data }) => {
    const { createProxyPackage: create } =
      await import('./proxy.service.server')
    return createSuccessResponse(await create(data), 'Tạo gói Proxy thành công')
  })
export const getProxyPackage = createServerFn({ method: 'GET' })
  .validator(getProxyPackageSchema)
  .handler(async ({ data }) => {
    const { getProxyPackage: get } = await import('./proxy.service.server')
    return createSuccessResponse(await get(data))
  })
export const updateProxyPackage = createServerFn({ method: 'POST' })
  .validator(updateProxyPackageSchema)
  .handler(async ({ data }) => {
    const { updateProxyPackage: update } =
      await import('./proxy.service.server')
    return createSuccessResponse(
      await update(data),
      'Cập nhật gói Proxy thành công',
    )
  })
