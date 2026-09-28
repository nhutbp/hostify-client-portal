import { z } from 'zod'

export const listHostingPackagesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(120).default(''),
  providerCategoryId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
})

const moneySchema = z.coerce.number().int().min(0).max(10_000_000_000)
const unlimitedCountSchema = z.coerce.number().int().min(-1).max(1_000_000)

export const createHostingPackageSchema = z.object({
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
  tags: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  imageUrl: z.string().trim().max(2048).nullable().default(null),
  storageGb: z.coerce.number().int().min(1).max(100_000),
  bandwidthGb: unlimitedCountSchema,
  websites: unlimitedCountSchema,
  databases: unlimitedCountSchema,
  cpuCores: z.coerce.number().int().min(0).max(256),
  ramGb: z.coerce.number().int().min(0).max(2048),
  emailAccounts: unlimitedCountSchema,
  addonDomains: unlimitedCountSchema,
  controlPanel: z.boolean(),
  freeSsl: z.boolean(),
  automaticBackups: z.boolean(),
  malwareProtection: z.boolean(),
  freeDomain: z.boolean(),
  multiplePhpVersions: z.boolean(),
  cronJobs: z.boolean(),
  staging: z.boolean(),
  defaultPrice: moneySchema.min(1),
  billingPrices: z
    .array(
      z.object({
        billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'YEARLY']),
        amount: moneySchema.min(1),
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

export const getHostingPackageSchema = z.object({ id: z.string().uuid() })
export const updateHostingPackageSchema = createHostingPackageSchema.extend({
  id: z.string().uuid(),
})

export type ListHostingPackagesInput = z.infer<typeof listHostingPackagesSchema>
export type CreateHostingPackageInput = z.infer<
  typeof createHostingPackageSchema
>
export type GetHostingPackageInput = z.infer<typeof getHostingPackageSchema>
export type UpdateHostingPackageInput = z.infer<
  typeof updateHostingPackageSchema
>
