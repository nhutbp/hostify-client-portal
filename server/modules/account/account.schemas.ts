import { z } from 'zod'
import { CUSTOMER_GENDER_VALUES } from '../../shared/constants'

export const accountResourceIdSchema = z.object({
  id: z.string().uuid(),
})

export const createAccountAddressSchema = z.object({
  label: z.string().trim().min(1).max(100),
  recipientName: z.string().trim().min(2).max(150),
  phone: z.string().trim().min(8).max(30),
  provinceCode: z.string().trim().min(1).max(30),
  provinceName: z.string().trim().min(1).max(150),
  wardCode: z.string().trim().min(1).max(30),
  wardName: z.string().trim().min(1).max(150),
  addressLine: z.string().trim().min(3).max(500),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  isDefault: z.boolean().default(false),
})

export const updateAccountProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(150),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  email: z.string().trim().email().max(255),
  birthDate: z.string().date().optional().or(z.literal('')),
  gender: z.enum(CUSTOMER_GENDER_VALUES),
})

export const updateAccountAvatarSchema = z.object({
  avatarUrl: z.string().trim().min(1).max(2000),
})

export const changeAccountPasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(1),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })
