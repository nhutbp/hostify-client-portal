import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../../common/response.server'
import {
  createViaPackageSchema,
  getViaPackageSchema,
  listViaPackagesSchema,
  updateViaPackageSchema,
} from './via.schemas'

export const listViaPackages = createServerFn({ method: 'GET' })
  .validator(listViaPackagesSchema)
  .handler(async ({ data }) => {
    const { listViaPackages: list } = await import('./via.service.server')
    return createSuccessResponse(await list(data))
  })
export const createViaPackage = createServerFn({ method: 'POST' })
  .validator(createViaPackageSchema)
  .handler(async ({ data }) => {
    const { createViaPackage: create } = await import('./via.service.server')
    return createSuccessResponse(await create(data), 'Tạo gói VIA thành công')
  })
export const getViaPackage = createServerFn({ method: 'GET' })
  .validator(getViaPackageSchema)
  .handler(async ({ data }) => {
    const { getViaPackage: get } = await import('./via.service.server')
    return createSuccessResponse(await get(data))
  })
export const updateViaPackage = createServerFn({ method: 'POST' })
  .validator(updateViaPackageSchema)
  .handler(async ({ data }) => {
    const { updateViaPackage: update } = await import('./via.service.server')
    return createSuccessResponse(
      await update(data),
      'Cập nhật gói VIA thành công',
    )
  })
