import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../../common/response.server'
import { apiKeyIdSchema, createApiKeySchema } from './api-keys.schemas'

export const getApiKeys = createServerFn({ method: 'GET' }).handler(async () => {
  const { listApiKeys } = await import('./api-keys.service.server')
  return createSuccessResponse(await listApiKeys())
})

export const createApiKey = createServerFn({ method: 'POST' })
  .validator(createApiKeySchema)
  .handler(async ({ data }) => {
    const { createApiKey: handler } = await import(
      './api-keys.service.server'
    )
    return createSuccessResponse(await handler(data))
  })

export const revokeApiKey = createServerFn({ method: 'POST' })
  .validator(apiKeyIdSchema)
  .handler(async ({ data }) => {
    const { revokeApiKey: handler } = await import(
      './api-keys.service.server'
    )
    return createSuccessResponse(await handler(data.id))
  })
