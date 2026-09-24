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
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export const customerServiceIdSchema = z.object({
  id: z.string().uuid(),
})

export type ListMyCustomerServicesInput = z.infer<
  typeof listMyCustomerServicesSchema
>
