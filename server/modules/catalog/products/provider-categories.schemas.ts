import { z } from 'zod'

const slug = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(100)

export const listProviderCategoriesSchema = z.object({
  search: z.string().trim().max(120).default(''),
})

export const createProviderCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: slug.optional(),
  description: z.string().trim().max(1000).optional(),
  imageUrl: z.string().trim().max(500).optional(),
})

export const updateProviderCategorySchema = createProviderCategorySchema.extend(
  {
    id: z.string().uuid(),
  },
)

export const deleteProviderCategorySchema = z.object({ id: z.string().uuid() })

export type ListProviderCategoriesInput = z.infer<
  typeof listProviderCategoriesSchema
>
export type CreateProviderCategoryInput = z.infer<
  typeof createProviderCategorySchema
>
export type UpdateProviderCategoryInput = z.infer<
  typeof updateProviderCategorySchema
>
