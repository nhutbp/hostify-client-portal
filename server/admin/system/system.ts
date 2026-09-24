import { createServerFn } from '@tanstack/react-start'
import { websiteSettingsSchema } from './system.schemas'

export const getPublicWebsiteSettings = createServerFn({
  method: 'GET',
}).handler(async () => {
  const { getWebsiteSettings } = await import('./system.service.server')
  return getWebsiteSettings()
})

export const saveWebsiteSettings = createServerFn({ method: 'POST' })
  .validator(websiteSettingsSchema)
  .handler(async ({ data }) => {
    const { updateWebsiteSettings } = await import('./system.service.server')
    return updateWebsiteSettings(data)
  })
