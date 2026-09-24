export const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'RESTORE',
  'STATUS_CHANGE',
  'PUBLISH',
  'UNPUBLISH',
  'ASSIGN',
  'UNASSIGN',
  'IMPORT',
  'EXPORT',
  'LOGIN',
  'LOGOUT',
] as const

export type AuditAction = (typeof AUDIT_ACTIONS)[number]

export const AUDIT_ACTION_CODES = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  RESTORE: 'RESTORE',
  STATUS_CHANGE: 'STATUS_CHANGE',
  PUBLISH: 'PUBLISH',
  UNPUBLISH: 'UNPUBLISH',
  ASSIGN: 'ASSIGN',
  UNASSIGN: 'UNASSIGN',
  IMPORT: 'IMPORT',
  EXPORT: 'EXPORT',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
} as const satisfies Record<AuditAction, AuditAction>

/** Shared identifiers for audit targets. Keep module/resource values here so
 * permissions, audit records, and UI filters use the same vocabulary. */
export const AUDIT_TARGETS = {
  POST: {
    MODULE: 'post',
    POST: 'post',
    CATEGORY: 'post_category',
    PLATFORM: 'post_platform',
  },
  APPEARANCE: { MODULE: 'appearance', MENU: 'menu' },
  MEDIA: { MODULE: 'media', LIBRARY: 'library', FOLDER: 'folder' },
  SYSTEM: { MODULE: 'system', SETTING: 'setting', API_KEY: 'api_key' },
  USER: {
    MODULE: 'user',
    USER: 'user',
    ROLE: 'role',
    PROFILE: 'profile',
    PASSWORD: 'password',
    ADDRESS: 'address',
  },
} as const

export const AUDIT_SOURCE_VALUES = [
  'admin',
  'api',
  'system',
  'job',
  'webhook',
] as const

export type AuditSource = (typeof AUDIT_SOURCE_VALUES)[number]

export const AUDIT_SOURCE_CODES = {
  ADMIN: 'admin',
  API: 'api',
  SYSTEM: 'system',
  JOB: 'job',
  WEBHOOK: 'webhook',
} as const satisfies Record<string, AuditSource>
