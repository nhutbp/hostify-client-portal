import { z } from 'zod'

export const createApiKeySchema = z.object({
  name: z.string().trim().min(1).max(100),
  expiresAt: z.string().date().optional(),
})

export const apiKeyIdSchema = z.object({ id: z.string().uuid() })

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>
