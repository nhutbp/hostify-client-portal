import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../common/response.server'
import {
  createMediaSchema,
  createMediaFolderSchema,
  mediaIdSchema,
  mediaListSchema,
  updateMediaSchema,
  updateMediaSettingsSchema,
} from './media.schemas'

export const getAdminMedia = createServerFn({ method: 'GET' })
  .validator(mediaListSchema)
  .handler(async ({ data }) => {
    const { listMedia } = await import('./media.service.server')
    return createSuccessResponse(await listMedia(data))
  })

export const createAdminMedia = createServerFn({ method: 'POST' })
  .validator(createMediaSchema)
  .handler(async ({ data }) => {
    const { createMedia } = await import('./media.service.server')
    return createSuccessResponse(await createMedia(data))
  })

export const createAdminMediaFolder = createServerFn({ method: 'POST' })
  .validator(createMediaFolderSchema)
  .handler(async ({ data }) => {
    const { createMediaFolder } = await import('./media.service.server')
    return createSuccessResponse(await createMediaFolder(data))
  })

export const updateAdminMedia = createServerFn({ method: 'POST' })
  .validator(updateMediaSchema)
  .handler(async ({ data }) => {
    const { id, ...input } = data
    const { updateMedia } = await import('./media.service.server')
    return createSuccessResponse(await updateMedia(id, input))
  })

export const deleteAdminMedia = createServerFn({ method: 'POST' })
  .validator(mediaIdSchema)
  .handler(async ({ data }) => {
    const { deleteMedia } = await import('./media.service.server')
    return createSuccessResponse(await deleteMedia(data.id))
  })

export const getAdminMediaSettings = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { getMediaSettings } = await import('./media.service.server')
    return createSuccessResponse(await getMediaSettings())
  },
)

export const updateAdminMediaSettings = createServerFn({ method: 'POST' })
  .validator(updateMediaSettingsSchema)
  .handler(async ({ data }) => {
    const { updateMediaSettings } = await import('./media.service.server')
    return createSuccessResponse(await updateMediaSettings(data))
  })
