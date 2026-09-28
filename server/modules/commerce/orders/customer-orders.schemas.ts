import { z } from 'zod'

const hostnameSchema = z
  .string()
  .trim()
  .max(253)
  .refine(
    (value) =>
      value
        .split('.')
        .every(
          (label) =>
            label.length <= 63 &&
            /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(label),
        ),
    'Hostname hoặc tên miền không hợp lệ',
  )

export const createPendingOrderSchema = z.object({
  idempotencyKey: z.uuid(),
  paymentMethod: z.enum(['WALLET', 'MOMO', 'VIETQR', 'CARD', 'USDT_TRC20']),
  customerNote: z.string().trim().max(1000).optional(),
  termsAccepted: z.literal(true),
  configurations: z
    .array(
      z.object({
        cartItemId: z.uuid(),
        operatingSystem: z.string().trim().max(100).optional(),
        hostname: hostnameSchema.optional(),
      }),
    )
    .max(100),
})

export const getCustomerOrderSchema = z.object({ id: z.uuid() })

export const listCustomerOrdersSchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z
    .enum([
      'DRAFT',
      'PENDING_PAYMENT',
      'PAID',
      'PROVISIONING',
      'COMPLETED',
      'FAILED',
      'CANCELLED',
      'REFUNDED',
    ])
    .optional(),
  sort: z.enum(['NEWEST', 'OLDEST']).default('NEWEST'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
})

export type CreatePendingOrderInput = z.infer<typeof createPendingOrderSchema>
export type ListCustomerOrdersInput = z.infer<typeof listCustomerOrdersSchema>
