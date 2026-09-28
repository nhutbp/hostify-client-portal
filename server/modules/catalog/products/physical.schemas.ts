import { z } from 'zod'

export const listPhysicalPackagesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(120).default(''),
  providerCategoryId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
})

export const createPhysicalPackageSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(1).max(200),
  content: z.string().trim().max(100_000).default(''),
  status: z.enum(['ACTIVE', 'DRAFT']).default('ACTIVE'),
  featured: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
  imageUrl: z.string().trim().max(2048).nullable().default(null),
  cpuModel: z.string().trim().min(2).max(120),
  cpuCores: z.coerce.number().int().min(1).max(512),
  ramGb: z.coerce.number().int().min(1).max(8192),
  storageGb: z.coerce.number().int().min(1).max(1_000_000),
  storageType: z.enum(['HDD', 'SSD', 'NVME']),
  bandwidthMbps: z.coerce.number().int().min(1).max(1_000_000),
  ipCount: z.coerce.number().int().min(1).max(1024),
  location: z.string().trim().max(120).default(''),
  defaultPrice: z.coerce.number().int().min(1).max(10_000_000_000),
  billingPrices: z
    .array(
      z.object({
        billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'YEARLY']),
        amount: z.coerce.number().int().min(1).max(10_000_000_000),
        discountPercent: z.coerce.number().min(0).max(100),
      }),
    )
    .min(1)
    .max(4)
    .superRefine((prices, context) => {
      const cycles = prices.map((price) => price.billingCycle)
      if (
        !cycles.includes('MONTHLY') ||
        new Set(cycles).size !== cycles.length
      ) {
        context.addIssue({
          code: 'custom',
          message: 'Cần giá tháng và mỗi thời hạn chỉ được xuất hiện một lần',
        })
      }
    }),
  providerCategoryId: z.string().uuid(),
})

export const getPhysicalPackageSchema = z.object({ id: z.string().uuid() })
export const updatePhysicalPackageSchema = createPhysicalPackageSchema.extend({
  id: z.string().uuid(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).default('ACTIVE'),
})

export type ListPhysicalPackagesInput = z.infer<
  typeof listPhysicalPackagesSchema
>
export type CreatePhysicalPackageInput = z.infer<
  typeof createPhysicalPackageSchema
>
export type GetPhysicalPackageInput = z.infer<typeof getPhysicalPackageSchema>
export type UpdatePhysicalPackageInput = z.infer<
  typeof updatePhysicalPackageSchema
>
