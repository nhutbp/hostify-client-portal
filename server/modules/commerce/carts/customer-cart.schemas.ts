import { z } from 'zod'

export const addCustomerCartItemSchema = z.object({
  productId: z.uuid(),
  planId: z.uuid(),
  billingCycle: z
    .string()
    .min(1)
    .max(32)
    .regex(/^[A-Z_]+$/),
  datacenterId: z.uuid().optional(),
})

export const removeCustomerCartItemSchema = z.object({ id: z.uuid() })

export const updateCustomerCartItemSchema = z.object({
  id: z.uuid(),
  quantity: z.number().int().min(1).max(100),
  billingCycle: z
    .string()
    .min(1)
    .max(32)
    .regex(/^[A-Z_]+$/),
  datacenterId: z.uuid().nullable().optional(),
  operatingSystem: z.string().trim().min(2).max(100).optional(),
})

export const applyCustomerCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/),
})

export type AddCustomerCartItemInput = z.infer<typeof addCustomerCartItemSchema>
export type UpdateCustomerCartItemInput = z.infer<
  typeof updateCustomerCartItemSchema
>
