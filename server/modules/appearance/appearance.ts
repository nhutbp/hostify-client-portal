import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../common/response.server'
import {
  createMenuSchema,
  listMenusSchema,
  menuIdSchema,
  updateMenuSchema,
} from './appearance.schemas'

export const getAdminMenus = createServerFn({ method: 'GET' })
  .validator(listMenusSchema)
  .handler(async () =>
    createSuccessResponse(
      await (await import('./appearance.service.server')).listMenus(),
    ),
  )
export const getPublicMainMenu = createServerFn({ method: 'GET' }).handler(
  async () => (await import('./appearance.service.server')).getPublicMainMenu(),
)
export const createAdminMenu = createServerFn({ method: 'POST' })
  .validator(createMenuSchema)
  .handler(async ({ data }) =>
    createSuccessResponse(
      await (await import('./appearance.service.server')).createMenu(data),
    ),
  )
export const updateAdminMenu = createServerFn({ method: 'POST' })
  .validator(updateMenuSchema)
  .handler(async ({ data }) =>
    createSuccessResponse(
      await (await import('./appearance.service.server')).updateMenu(data),
    ),
  )
export const deleteAdminMenu = createServerFn({ method: 'POST' })
  .validator(menuIdSchema)
  .handler(async ({ data }) =>
    createSuccessResponse(
      await (await import('./appearance.service.server')).deleteMenu(data.id),
    ),
  )
