import { useQuery } from '@tanstack/react-query'
import { auditService } from '../services/auditService'
import type { AuditListInput } from '../services/auditService'

export function useAuditLogs(input: AuditListInput) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', input],
    queryFn: () => auditService.list(input),
    placeholderData: (previous) => previous,
  })
}
