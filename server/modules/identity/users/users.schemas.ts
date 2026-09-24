import { z } from 'zod'
import { ADMIN_ASSIGNABLE_ROLE_CODES } from '../../../../shared/roles'
import {
  ADMIN_USER_STATUS_VALUES,
  ADMIN_USER_MUTABLE_STATUS_VALUES,
  CUSTOMER_GENDER_VALUES,
} from '../../../shared/constants'

const ADMIN_USER_ROLE_FILTER_VALUES = [
  'ALL',
  'CUSTOMER',
  'STAFF',
  'ADMIN',
] as const

export const adminUserRoleSchema = z.enum(ADMIN_USER_ROLE_FILTER_VALUES)

export const adminUserStatusSchema = z.enum(ADMIN_USER_STATUS_VALUES)

export const listAdminUsersSchema = z.object({
  search: z.string().trim().max(120).optional().default(''),
  role: adminUserRoleSchema.optional().default('ALL'),
  status: adminUserStatusSchema.optional().default('ALL'),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(5).max(100).default(10),
})

export const createAdminUserSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  login: z.string().trim().min(3).max(80).toLowerCase(),
  email: z.string().trim().email().toLowerCase(),
  phone: z.string().trim().max(30).optional(),
  password: z.string().min(6).max(100),
  roleCode: z.enum(ADMIN_ASSIGNABLE_ROLE_CODES),
  status: z.enum(ADMIN_USER_MUTABLE_STATUS_VALUES).default('ACTIVE'),
})

export const updateAdminUserStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(ADMIN_USER_MUTABLE_STATUS_VALUES),
})

export const bulkUpdateAdminUserStatusSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  status: z.enum(ADMIN_USER_MUTABLE_STATUS_VALUES),
})

export const adminUserDetailSchema = z.object({ id: z.string().uuid() })

export const updateAdminUserProfileSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().toLowerCase(),
  phone: z.string().trim().max(30).optional(),
  avatarUrl: z.string().trim().max(500).optional(),
  birthDate: z.string().date().optional(),
  gender: z.enum(CUSTOMER_GENDER_VALUES),
})

export const updateAdminUserRolesSchema = z.object({
  id: z.string().uuid(),
  roleCodes: z
    .array(
      z
        .string()
        .trim()
        .min(2)
        .max(80)
        .regex(/^[A-Z0-9_]+$/),
    )
    .min(1)
    .max(20)
    .transform((codes) => [...new Set(codes)]),
})

export const resetAdminUserPasswordSchema = z.object({
  id: z.string().uuid(),
  password: z.string().min(6).max(100),
})

export const revokeAdminUserSessionsSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
})

export const adminRoleDetailSchema = z.object({ id: z.string().uuid() })

export const createAdminRoleSchema = z.object({
  name: z.string().trim().min(2).max(100),
  code: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[A-Z0-9_]+$/),
  description: z.string().trim().max(500).optional(),
  canAccessDashboard: z.boolean().default(true),
  permissionCodes: z.array(z.string().min(1).max(120)).max(200).default([]),
})

export const updateAdminRoleSchema = createAdminRoleSchema.extend({
  id: z.string().uuid(),
  code: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[A-Z0-9_]+$/),
})

export type ListAdminUsersInput = z.infer<typeof listAdminUsersSchema>
export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>
export type UpdateAdminUserStatusInput = z.infer<
  typeof updateAdminUserStatusSchema
>
export type BulkUpdateAdminUserStatusInput = z.infer<
  typeof bulkUpdateAdminUserStatusSchema
>
export type UpdateAdminUserProfileInput = z.infer<
  typeof updateAdminUserProfileSchema
>
export type UpdateAdminUserRolesInput = z.infer<
  typeof updateAdminUserRolesSchema
>
export type ResetAdminUserPasswordInput = z.infer<
  typeof resetAdminUserPasswordSchema
>
export type RevokeAdminUserSessionsInput = z.infer<
  typeof revokeAdminUserSessionsSchema
>
export type CreateAdminRoleInput = z.infer<typeof createAdminRoleSchema>
export type UpdateAdminRoleInput = z.infer<typeof updateAdminRoleSchema>
