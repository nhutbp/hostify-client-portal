import { requirePermission } from '../../common/auth-context.server'
import { prisma } from '../../db/prisma'
import type { WebsiteSettingsInput } from './system.schemas'
import { recordAuditLog } from '../../common/audit/audit.service.server'

const WEBSITE_SETTINGS_OPTION = 'website_settings'
const defaults: WebsiteSettingsInput = {
  siteName: 'App Base',
  logoUrl: '',
  faviconUrl: '',
}

export async function getWebsiteSettings() {
  const option = await prisma.option.findUnique({
    where: { optionName: WEBSITE_SETTINGS_OPTION },
  })
  if (!option) return defaults
  try {
    return { ...defaults, ...(JSON.parse(option.optionValue) as object) }
  } catch {
    return defaults
  }
}

export async function updateWebsiteSettings(input: WebsiteSettingsInput) {
  const { user } = await requirePermission('system.setting.update')
  const previous = await getWebsiteSettings()
  await prisma.option.upsert({
    where: { optionName: WEBSITE_SETTINGS_OPTION },
    create: {
      optionName: WEBSITE_SETTINGS_OPTION,
      optionValue: JSON.stringify(input),
      autoload: true,
    },
    update: { optionValue: JSON.stringify(input), autoload: true },
  })
  await recordAuditLog({
    actorUserId: user.id,
    module: 'system',
    resource: 'setting',
    action: 'UPDATE',
    entityId: null,
    before: previous,
    after: input,
    source: 'admin',
  })
  return input
}
