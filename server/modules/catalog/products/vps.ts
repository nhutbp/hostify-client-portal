import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../../common/response.server'
import {
  createVpsPackageSchema,
  getVpsPackageSchema,
  listVpsPackagesSchema,
  setVpsPackageStatusSchema,
  updateVpsPackageSchema,
  vpsLookupSchema,
} from './vps.schemas'

export const getVpsPackageLookups = createServerFn({ method: 'GET' })
  .validator(vpsLookupSchema)
  .handler(async () => {
    const { getVpsPackageLookups: getLookups } =
      await import('./vps.service.server')
    return createSuccessResponse(await getLookups())
  })

export const createVpsPackage = createServerFn({ method: 'POST' })
  .validator(createVpsPackageSchema)
  .handler(async ({ data }) => {
    const { createVpsPackage: createPackage } =
      await import('./vps.service.server')
    return createSuccessResponse(
      await createPackage(data),
      'Tạo gói VPS thành công',
    )
  })

export const updateVpsPackage = createServerFn({ method: 'POST' })
  .validator(updateVpsPackageSchema)
  .handler(async ({ data }) => {
    const { updateVpsPackage: updatePackage } =
      await import('./vps.service.server')
    return createSuccessResponse(
      await updatePackage(data),
      'Cập nhật gói VPS thành công',
    )
  })

export const listVpsPackages = createServerFn({ method: 'GET' })
  .validator(listVpsPackagesSchema)
  .handler(async ({ data }) => {
    const { listVpsPackages: listPackages } =
      await import('./vps.service.server')
    return createSuccessResponse(await listPackages(data))
  })

export const getVpsPackage = createServerFn({ method: 'GET' })
  .validator(getVpsPackageSchema)
  .handler(async ({ data }) => {
    const { getVpsPackage: getPackage } = await import('./vps.service.server')
    return createSuccessResponse(await getPackage(data))
  })

export const setVpsPackageStatus = createServerFn({ method: 'POST' })
  .validator(setVpsPackageStatusSchema)
  .handler(async ({ data }) => {
    const { setVpsPackageStatus: setStatus } =
      await import('./vps.service.server')
    return createSuccessResponse(await setStatus(data))
  })
