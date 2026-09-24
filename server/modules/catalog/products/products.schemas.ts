import { z } from 'zod'

export const listCatalogProductsSchema = z.object({
  category: z.string().trim().min(1).max(50).optional(),
  search: z.string().trim().max(120).optional().default(''),
  includeArchived: z.boolean().optional().default(false),
})

export const catalogProductIdSchema = z.object({
  id: z.string().uuid(),
})

export type ListCatalogProductsInput = z.infer<
  typeof listCatalogProductsSchema
>
