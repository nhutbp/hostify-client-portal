import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createSuccessResponse } from '../../common/response.server'
import { requirePermission } from '../../common/auth-context.server'
import { listAuditLogs } from '../../common/audit/audit.service.server'
import { listAuditLogsSchema } from './audit.schemas'

export const getAdminAuditLogs = createServerFn({ method: 'GET' })
  .validator(listAuditLogsSchema)
  .handler(async ({ data }) => {
    await requirePermission('system.audit_log.view')
    return createSuccessResponse(await listAuditLogs(data))
  })

export const getAdminAuditLog = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    await requirePermission('system.audit_log.view')
    const { prisma } = await import('../../db/prisma')
    return createSuccessResponse(
      await prisma.auditLog.findUnique({ where: { id: data.id } }),
    )
  })
