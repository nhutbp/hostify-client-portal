import { z } from 'zod'

export const listViaPackagesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(120).default(''),
  providerCategoryId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
})

export const viaQuantityPriceSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(100_000),
  amount: z.coerce.number().int().min(1).max(10_000_000_000),
  discountPercent: z.coerce.number().min(0).max(100),
})

const viaPackageBaseSchema = z.object({
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
  platform: z.enum(['FACEBOOK', 'GOOGLE', 'TIKTOK']),
  country: z.enum(['US', 'VN', 'SG', 'JP', 'DE']),
  accountType: z.enum(['VIA', 'BM', 'ADS']),
  accountAge: z.enum(['NEW', 'SIX_MONTHS', 'ONE_YEAR']),
  verification: z.enum(['VERIFIED', 'UNVERIFIED']),
  twoFactor: z.boolean().default(false),
  changeLimit: z.enum(['UNLIMITED', 'LIMITED', 'NO_CHANGE']),
  deliveryMethod: z.enum(['ACCOUNT_PASSWORD', 'ACCOUNT_PASSWORD_2FA']),
  warrantyDays: z.coerce.number().int().min(0).max(365),
  originalEmail: z.boolean().default(false),
  originalPhone: z.boolean().default(false),
  birthday: z.boolean().default(false),
  loginBrowser: z.boolean().default(false),
  backupCookie: z.boolean().default(false),
  usageGuide: z.boolean().default(false),
  defaultPrice: z.coerce.number().int().min(1).max(10_000_000_000),
  quantityPrices: z
    .array(viaQuantityPriceSchema)
    .min(1)
    .max(20)
    .superRefine((prices, context) => {
      const quantities = prices.map((price) => price.quantity)
      if (
        !quantities.includes(1) ||
        new Set(quantities).size !== quantities.length
      )
        context.addIssue({
          code: 'custom',
          message:
            'Cần giá cho 1 tài khoản và mỗi số lượng chỉ xuất hiện một lần',
        })
    }),
  providerCategoryId: z.string().uuid(),
})

function validateUnitPrice(
  input: Pick<
    z.infer<typeof viaPackageBaseSchema>,
    'quantityPrices' | 'defaultPrice'
  >,
  context: z.RefinementCtx,
) {
  if (
    input.quantityPrices.find((price) => price.quantity === 1)?.amount !==
    input.defaultPrice
  )
    context.addIssue({
      code: 'custom',
      path: ['quantityPrices'],
      message: 'Giá 1 tài khoản phải bằng giá bán mặc định',
    })
}

export const createViaPackageSchema =
  viaPackageBaseSchema.superRefine(validateUnitPrice)

export const getViaPackageSchema = z.object({ id: z.string().uuid() })
export const updateViaPackageSchema = viaPackageBaseSchema
  .extend({
    id: z.string().uuid(),
    status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).default('ACTIVE'),
  })
  .superRefine(validateUnitPrice)

export type ListViaPackagesInput = z.infer<typeof listViaPackagesSchema>
export type CreateViaPackageInput = z.infer<typeof createViaPackageSchema>
export type GetViaPackageInput = z.infer<typeof getViaPackageSchema>
export type UpdateViaPackageInput = z.infer<typeof updateViaPackageSchema>
