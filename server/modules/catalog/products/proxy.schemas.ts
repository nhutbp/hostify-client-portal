import { z } from 'zod'

export const listProxyPackagesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(120).default(''),
  providerCategoryId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
})

const billingPriceSchema = z.object({
  billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'YEARLY']),
  amount: z.coerce.number().int().min(1).max(10_000_000_000),
  discountPercent: z.coerce.number().min(0).max(100),
})

export const createProxyPackageSchema = z.object({
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
  proxyType: z.enum(['RESIDENTIAL', 'DATACENTER', 'MOBILE']),
  displayCategory: z.string().trim().min(2).max(100),
  country: z.enum(['US', 'VN', 'SG', 'JP', 'DE']),
  ipMode: z.enum(['STATIC', 'ROTATING']),
  protocols: z
    .array(z.enum(['HTTP', 'HTTPS', 'SOCKS5']))
    .min(1)
    .max(3)
    .refine((values) => new Set(values).size === values.length),
  ipDelivery: z.enum(['INSTANT', 'MANUAL']),
  bandwidthGb: z.coerce
    .number()
    .int()
    .min(-1)
    .max(1_000_000)
    .refine((value) => value === -1 || value > 0),
  concurrentConnections: z.coerce.number().int().min(1).max(1_000_000),
  autoRotation: z.boolean().default(false),
  whitelistIp: z.boolean().default(false),
  cityTargeting: z.boolean().default(false),
  ipReplacement: z.boolean().default(false),
  cleanIp: z.boolean().default(false),
  apiSupport: z.boolean().default(false),
  ipWarranty: z.boolean().default(false),
  support24h: z.boolean().default(false),
  defaultPrice: z.coerce.number().int().min(1).max(10_000_000_000),
  billingPrices: z
    .array(billingPriceSchema)
    .min(1)
    .max(4)
    .superRefine((prices, context) => {
      const cycles = prices.map((price) => price.billingCycle)
      if (!cycles.includes('MONTHLY') || new Set(cycles).size !== cycles.length)
        context.addIssue({
          code: 'custom',
          message: 'Cần giá tháng và mỗi thời hạn chỉ xuất hiện một lần',
        })
    }),
  providerCategoryId: z.string().uuid(),
})

export const getProxyPackageSchema = z.object({ id: z.string().uuid() })
export const updateProxyPackageSchema = createProxyPackageSchema.extend({
  id: z.string().uuid(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).default('ACTIVE'),
})

export type ListProxyPackagesInput = z.infer<typeof listProxyPackagesSchema>
export type CreateProxyPackageInput = z.infer<typeof createProxyPackageSchema>
export type GetProxyPackageInput = z.infer<typeof getProxyPackageSchema>
export type UpdateProxyPackageInput = z.infer<typeof updateProxyPackageSchema>
