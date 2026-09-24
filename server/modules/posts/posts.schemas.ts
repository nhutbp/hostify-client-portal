import { z } from 'zod'

const POST_STATUS_VALUES = ['DRAFT', 'PUBLISHED'] as const
const POST_VISIBILITY_VALUES = ['PUBLIC', 'PRIVATE'] as const
const status = z.enum(POST_STATUS_VALUES)
const visibility = z.enum(POST_VISIBILITY_VALUES)

export const listPostsSchema = z.object({
  search: z.string().trim().optional().default(''),
  status: status.optional(),
  categoryId: z.string().uuid().optional(),
  platformId: z.string().uuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
})
export const createPostSchema = z.object({
  title: z.string().trim().min(1).max(255),
  slug: z.string().trim().min(1).max(180),
  excerpt: z.string().optional(),
  content: z.string().default(''),
  status: status.default('DRAFT'),
  visibility: visibility.default('PUBLIC'),
  featuredImage: z.string().trim().optional(),
  metaVideoUrl: z.string().trim().url().optional(),
  categoryIds: z.array(z.string().uuid()).default([]),
  platformIds: z.array(z.string().uuid()).default([]),
})
export const updatePostSchema = createPostSchema.extend({
  id: z.string().uuid(),
})
export const postIdSchema = z.object({ id: z.string().uuid() })
export const listPostCategoriesSchema = z.object({
  search: z.string().trim().optional().default(''),
})
export const listPostPlatformsSchema = z.object({})
export const createPostPlatformSchema = z.object({
  name: z.string().trim().min(1).max(150),
  slug: z.string().trim().optional(),
  description: z.string().optional(),
})
export const updatePostPlatformSchema = createPostPlatformSchema.extend({
  id: z.string().uuid(),
})
export const publicPostsSchema = z.object({
  categorySlug: z.string().trim().optional(),
  platformSlug: z.string().trim().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(30).default(10),
})
export const publicPostsByCategorySchema = publicPostsSchema.extend({
  categorySlug: z.string().trim().min(1),
})
export const publicPostsByPlatformSchema = publicPostsSchema.extend({
  platformSlug: z.string().trim().min(1),
})
export const publicPostsHttpQuerySchema = z.object({
  categorySlug: z.string().trim().optional(),
  platformSlug: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(30).default(10),
})
export const publicPostsByCategoryHttpQuerySchema = publicPostsHttpQuerySchema.extend({
  categorySlug: z.string().trim().min(1),
})
export const publicPostsByPlatformHttpQuerySchema = publicPostsHttpQuerySchema.extend({
  platformSlug: z.string().trim().min(1),
})
export const createPostCategorySchema = z.object({
  name: z.string().trim().min(1).max(150),
  slug: z.string().trim().optional(),
  description: z.string().optional(),
  imageUrl: z.string().trim().optional(),
  parentId: z.string().uuid().optional(),
})
export const updatePostCategorySchema = createPostCategorySchema.extend({
  id: z.string().uuid(),
})

export type ListPostsInput = z.infer<typeof listPostsSchema>
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type ListPostCategoriesInput = z.infer<typeof listPostCategoriesSchema>
export type CreatePostCategoryInput = z.infer<typeof createPostCategorySchema>
export type UpdatePostCategoryInput = z.infer<typeof updatePostCategorySchema>
export type CreatePostPlatformInput = z.infer<typeof createPostPlatformSchema>
export type UpdatePostPlatformInput = z.infer<typeof updatePostPlatformSchema>
export type PublicPostsInput = z.infer<typeof publicPostsSchema>
