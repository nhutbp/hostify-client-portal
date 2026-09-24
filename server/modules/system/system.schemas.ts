import { z } from 'zod'

export const websiteSettingsSchema = z.object({
  siteName: z.string().trim().min(1).max(120),
  logoUrl: z.string().trim().max(2000).default(''),
  faviconUrl: z.string().trim().max(2000).default(''),
})

export type WebsiteSettingsInput = z.infer<typeof websiteSettingsSchema>
