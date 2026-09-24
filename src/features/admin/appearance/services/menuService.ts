import {
  createAdminMenu,
  deleteAdminMenu,
  getAdminMenus,
  updateAdminMenu,
} from '../../../../../server/modules/appearance/appearance'
import type {
  CreateMenuInput,
  ListMenusInput,
  UpdateMenuInput,
} from '../../../../../server/modules/appearance/appearance.schemas'
import { unwrapSuccessResponse } from '@/utils/response'

export type {
  CreateMenuInput,
  ListMenusInput,
  UpdateMenuInput,
} from '../../../../../server/modules/appearance/appearance.schemas'
export const menuService = {
  list: (input: ListMenusInput) =>
    getAdminMenus({ data: input }).then(unwrapSuccessResponse),
  create: (input: CreateMenuInput) =>
    createAdminMenu({ data: input }).then(unwrapSuccessResponse),
  update: (input: UpdateMenuInput) =>
    updateAdminMenu({ data: input }).then(unwrapSuccessResponse),
  delete: (id: string) =>
    deleteAdminMenu({ data: { id } }).then(unwrapSuccessResponse),
}
