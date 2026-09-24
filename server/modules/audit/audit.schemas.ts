import { z } from 'zod'
import { AUDIT_ACTIONS } from '../../common/audit/audit.constants'

export const listAuditLogsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional().default(''),
  module: z.string().trim().optional(),
  action: z.enum(AUDIT_ACTIONS).optional(),
  actorUserId: z.string().uuid().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

export type ListAuditLogsInput = z.infer<typeof listAuditLogsSchema>
