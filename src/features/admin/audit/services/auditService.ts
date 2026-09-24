import { getAdminAuditLogs } from '../../../../../server/modules/audit/audit-logs/audit'
import { unwrapSuccessResponse } from '@/utils/response'
import type { AuditAction } from '../../../../../server/common/audit/audit.constants'

export type AuditListInput = {
  page: number
  limit: number
  search?: string
  module?: string
  action?: AuditAction
  from?: string
  to?: string
}

export type AuditListResult = Awaited<ReturnType<typeof getAdminAuditLogs>>

export const auditService = {
  list: (input: AuditListInput) =>
    getAdminAuditLogs({ data: input }).then(
      unwrapSuccessResponse,
    ) as Promise<AuditListResult>,
}
