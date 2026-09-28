import { z } from 'zod'

export const listCustomerPackagesSchema = z.object({
  category: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
})
