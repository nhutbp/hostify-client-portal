import { z } from 'zod'

const SERVICE_STATUSES = [
  'PENDING',
  'PROVISIONING',
  'ACTIVE',
  'SUSPENDED',
  'EXPIRED',
  'TERMINATED',
  'ERROR',
] as const

export const listMyCustomerServicesSchema = z.object({
  status: z.enum(SERVICE_STATUSES).optional(),
  category: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  providerId: z.uuid().optional(),
  search: z.string().trim().max(100).optional(),
  sort: z.enum(['NEWEST', 'OLDEST', 'EXPIRING']).default('NEWEST'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(6),
})

export const customerServiceIdSchema = z.object({
  id: z.string().uuid(),
})

export type ListMyCustomerServicesInput = z.infer<
  typeof listMyCustomerServicesSchema
>
