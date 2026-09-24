import { createAppError } from '../../common/app-error.server'
import { requirePermission } from '../../common/auth-context.server'
import {
  createMenuRecord,
  deleteMenuRecord,
  findMainMenuRecord,
  findMenuRecord,
  listMenuRecords,
  updateMenuRecord,
} from './appearance.repository.server'
import type { CreateMenuInput, UpdateMenuInput } from './appearance.schemas'
import { APPEARANCE_ERROR_CODES } from './appearance.errors'
import { recordAuditLog } from '../../common/audit/audit.service.server'
import {
  AUDIT_TARGETS,
  AUDIT_ACTION_CODES,
  AUDIT_SOURCE_CODES,
} from '../../common/audit/audit.constants'

export async function listMenus() {
  await requirePermission('appearance.menu.view')
  return listMenuRecords()
}
export async function getPublicMainMenu() {
  return findMainMenuRecord()
}
export async function getMenu(id: string) {
  await requirePermission('appearance.menu.view')
  const menu = await findMenuRecord(id)
  if (!menu)
    throw createAppError({
      message: 'Không tìm thấy menu',
      errorCode: APPEARANCE_ERROR_CODES.MENU_NOT_FOUND,
      statusCode: 404,
    })
  return menu
}
export async function createMenu(input: CreateMenuInput) {
  const { user } = await requirePermission('appearance.menu.create')
  const menu = await createMenuRecord(input)
  await recordAuditLog({
    actorUserId: user.id,
    module: AUDIT_TARGETS.APPEARANCE.MODULE,
    resource: AUDIT_TARGETS.APPEARANCE.MENU,
    action: AUDIT_ACTION_CODES.CREATE,
    entityId: menu.id,
    after: { name: menu.name },
    source: AUDIT_SOURCE_CODES.ADMIN,
  })
  return menu
}
export async function updateMenu(input: UpdateMenuInput) {
  const { user } = await requirePermission('appearance.menu.update')
  const existing = await getMenu(input.id)
  const menu = await updateMenuRecord(input)
  await recordAuditLog({
    actorUserId: user.id,
    module: AUDIT_TARGETS.APPEARANCE.MODULE,
    resource: AUDIT_TARGETS.APPEARANCE.MENU,
    action: AUDIT_ACTION_CODES.UPDATE,
    entityId: menu.id,
    before: { name: existing.name },
    after: { name: menu.name },
    source: AUDIT_SOURCE_CODES.ADMIN,
  })
  return menu
}
export async function deleteMenu(id: string) {
  const { user } = await requirePermission('appearance.menu.delete')
  const menu = await getMenu(id)
  const result = await deleteMenuRecord(id)
  await recordAuditLog({
    actorUserId: user.id,
    module: AUDIT_TARGETS.APPEARANCE.MODULE,
    resource: AUDIT_TARGETS.APPEARANCE.MENU,
    action: AUDIT_ACTION_CODES.DELETE,
    entityId: id,
    before: { name: menu.name },
    source: AUDIT_SOURCE_CODES.ADMIN,
  })
  return result
}
