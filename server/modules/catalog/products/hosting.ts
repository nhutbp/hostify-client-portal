import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../../common/response.server'
import {
  createHostingPackageSchema,
  getHostingPackageSchema,
  listHostingPackagesSchema,
  updateHostingPackageSchema,
} from './hosting.schemas'

export const listHostingPackages = createServerFn({ method: 'GET' })
  .validator(listHostingPackagesSchema)
  .handler(async ({ data }) => {
    const { listHostingPackages: listPackages } =
      await import('./hosting.service.server')
    return createSuccessResponse(await listPackages(data))
  })

export const createHostingPackage = createServerFn({ method: 'POST' })
  .validator(createHostingPackageSchema)
  .handler(async ({ data }) => {
    const { createHostingPackage: createPackage } =
      await import('./hosting.service.server')
    return createSuccessResponse(
      await createPackage(data),
      'Tạo gói Hosting thành công',
    )
  })

export const getHostingPackage = createServerFn({ method: 'GET' })
  .validator(getHostingPackageSchema)
  .handler(async ({ data }) => {
    const { getHostingPackage: getPackage } =
      await import('./hosting.service.server')
    return createSuccessResponse(await getPackage(data))
  })

export const updateHostingPackage = createServerFn({ method: 'POST' })
  .validator(updateHostingPackageSchema)
  .handler(async ({ data }) => {
    const { updateHostingPackage: updatePackage } =
      await import('./hosting.service.server')
    return createSuccessResponse(
      await updatePackage(data),
      'Cập nhật gói Hosting thành công',
    )
  })
