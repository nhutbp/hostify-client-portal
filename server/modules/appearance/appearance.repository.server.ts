import { createId } from '../../common/id.server'
import { prisma } from '../../db/prisma'
import type { CreateMenuInput, UpdateMenuInput } from './appearance.schemas'

const navigationMenu = (prisma as unknown as {
  navigationMenu: any
}).navigationMenu

export function listMenuRecords() {
  return navigationMenu.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: 'desc' },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  })
}
export function findMenuRecord(id: string) {
  return navigationMenu.findFirst({
    where: { id, deletedAt: null },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  })
}
export function findMainMenuRecord() {
  return navigationMenu.findFirst({
    where: { deletedAt: null, locations: { has: 'main' } },
    orderBy: { updatedAt: 'desc' },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  })
}
export function createMenuRecord(input: CreateMenuInput) {
  return navigationMenu.create({
    data: {
      id: createId(),
      name: input.name,
      locations: input.locations,
      autoAddPages: input.autoAddPages,
    },
  })
}
export function updateMenuRecord(input: UpdateMenuInput) {
  return navigationMenu.update({
    where: { id: input.id },
    data: {
      name: input.name,
      locations: input.locations,
      autoAddPages: input.autoAddPages,
      items: {
        deleteMany: {},
        create: input.items.map((item, index) => ({
          id: item.id ?? createId(),
          label: item.label,
          url: item.url,
          parentId: item.parentId,
          icon: item.icon,
          imageUrl: item.imageUrl,
          itemType: item.itemType,
          sortOrder: index,
        })),
      },
    },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  })
}
export function deleteMenuRecord(id: string) {
  return navigationMenu.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}
