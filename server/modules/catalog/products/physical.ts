import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../../common/response.server'
import {
  createPhysicalPackageSchema,
  getPhysicalPackageSchema,
  listPhysicalPackagesSchema,
  updatePhysicalPackageSchema,
} from './physical.schemas'

export const listPhysicalPackages = createServerFn({ method: 'GET' })
  .validator(listPhysicalPackagesSchema)
  .handler(async ({ data }) => {
    const { listPhysicalPackages: listPackages } =
      await import('./physical.service.server')
    return createSuccessResponse(await listPackages(data))
  })

export const createPhysicalPackage = createServerFn({ method: 'POST' })
  .validator(createPhysicalPackageSchema)
  .handler(async ({ data }) => {
    const { createPhysicalPackage: createPackage } =
      await import('./physical.service.server')
    return createSuccessResponse(
      await createPackage(data),
      'Tạo gói Máy chủ vật lý thành công',
    )
  })

export const getPhysicalPackage = createServerFn({ method: 'GET' })
  .validator(getPhysicalPackageSchema)
  .handler(async ({ data }) => {
    const { getPhysicalPackage: getPackage } =
      await import('./physical.service.server')
    return createSuccessResponse(await getPackage(data))
  })

export const updatePhysicalPackage = createServerFn({ method: 'POST' })
  .validator(updatePhysicalPackageSchema)
  .handler(async ({ data }) => {
    const { updatePhysicalPackage: updatePackage } =
      await import('./physical.service.server')
    return createSuccessResponse(
      await updatePackage(data),
      'Cập nhật gói Máy chủ vật lý thành công',
    )
  })
