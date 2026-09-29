import { z } from 'zod'

export const adminOrderStatuses = [
  'DRAFT',
  'PENDING_PAYMENT',
  'PAID',
  'PROVISIONING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
] as const

export const listAdminOrdersSchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    status: z.enum(adminOrderStatuses).optional(),
    categoryId: z.uuid().optional(),
    providerCategoryId: z.uuid().optional(),
    dateFrom: z.iso.date().optional(),
    dateTo: z.iso.date().optional(),
    sort: z
      .enum(['NEWEST', 'OLDEST', 'TOTAL_DESC', 'TOTAL_ASC'])
      .default('NEWEST'),
    page: z.number().int().positive().default(1),
    limit: z.number().int().min(1).max(100).default(8),
  })
  .refine(
    (value) =>
      !value.dateFrom || !value.dateTo || value.dateFrom <= value.dateTo,
    {
      message: 'Ngày bắt đầu phải trước ngày kết thúc',
      path: ['dateTo'],
    },
  )

export type ListAdminOrdersInput = z.infer<typeof listAdminOrdersSchema>

export const getAdminOrderSchema = z.object({ id: z.uuid() })

export const updateAdminOrderSchema = z.object({
  id: z.uuid(),
  expectedStatus: z.enum(adminOrderStatuses),
  status: z.enum([
    'PENDING_PAYMENT',
    'PAID',
    'PROVISIONING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
  ]),
  paymentMethod: z
    .enum(['WALLET', 'MOMO', 'VIETQR', 'CARD', 'USDT_TRC20'])
    .nullable(),
  paymentReference: z.string().trim().max(120).optional(),
  paidAt: z.iso.datetime({ offset: true }).optional(),
  manualFulfillmentConfirmed: z.boolean().default(false),
})

export type UpdateAdminOrderInput = z.infer<typeof updateAdminOrderSchema>
