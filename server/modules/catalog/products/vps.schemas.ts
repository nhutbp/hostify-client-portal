import { z } from 'zod'

const moneySchema = z.coerce.number().int().min(0).max(10_000_000_000)

export const createVpsPackageSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(1).max(500),
  content: z.string().trim().max(100_000).default(''),
  code: z.string().trim().min(2).max(60).optional(),
  status: z.enum(['DRAFT', 'ACTIVE']).default('DRAFT'),
  featured: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  imageUrl: z.string().trim().max(500).nullable().optional(),
  cpu: z.coerce.number().int().min(1).max(256),
  ramGb: z.coerce.number().int().min(1).max(2048),
  diskGb: z.coerce.number().int().min(1).max(100_000),
  diskType: z.string().trim().min(2).max(50).default('NVMe SSD'),
  operatingSystem: z.string().trim().min(2).max(100).default('AlmaLinux 8.4'),
  bandwidth: z.string().trim().min(1).max(80).default('UNLIMITED'),
  ipCount: z.coerce.number().int().min(0).max(1024).default(1),
  providerCategoryId: z.string().uuid(),
  datacenterIds: z.array(z.string().uuid()).min(1).max(20),
  billingPrices: z
    .array(
      z.object({
        billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'YEARLY']),
        amount: moneySchema,
        discountPercent: z.coerce.number().min(0).max(100).default(0),
      }),
    )
    .min(1),
})

export const updateVpsPackageSchema = createVpsPackageSchema
  .omit({ code: true })
  .extend({ id: z.string().uuid() })

export const vpsLookupSchema = z.object({})
export const getVpsPackageSchema = z.object({ id: z.string().uuid() })
export const listVpsPackagesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(120).default(''),
  providerCategoryId: z.string().uuid().optional(),
  datacenterId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'DRAFT']).optional(),
})
export const setVpsPackageStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['ACTIVE', 'DRAFT']),
})
export type CreateVpsPackageInput = z.infer<typeof createVpsPackageSchema>
export type UpdateVpsPackageInput = z.infer<typeof updateVpsPackageSchema>
export type ListVpsPackagesInput = z.infer<typeof listVpsPackagesSchema>
export type GetVpsPackageInput = z.infer<typeof getVpsPackageSchema>
export type SetVpsPackageStatusInput = z.infer<typeof setVpsPackageStatusSchema>
