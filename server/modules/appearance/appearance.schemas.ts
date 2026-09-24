import { z } from 'zod'

const menuItem = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(1).max(255),
  url: z.string().trim().min(1).max(500),
  parentId: z.string().uuid().nullable().optional(),
  icon: z.string().trim().max(50).nullable().optional(),
  imageUrl: z.string().trim().max(1000).nullable().optional(),
  itemType: z.string().trim().max(50).default('custom'),
  sortOrder: z.number().int().min(0).default(0),
})
export const listMenusSchema = z.object({})
export const menuIdSchema = z.object({ id: z.string().uuid() })
export const createMenuSchema = z.object({
  name: z.string().trim().min(1).max(150),
  locations: z.array(z.string().max(50)).default([]),
  autoAddPages: z.boolean().default(false),
})
export const updateMenuSchema = createMenuSchema.extend({
  id: z.string().uuid(),
  items: z.array(menuItem).default([]),
})
export type ListMenusInput = z.infer<typeof listMenusSchema>
export type CreateMenuInput = z.infer<typeof createMenuSchema>
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>
