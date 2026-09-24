import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../common/response.server'
import {
  createPostCategorySchema,
  createPostPlatformSchema,
  createPostSchema,
  listPostCategoriesSchema,
  listPostPlatformsSchema,
  listPostsSchema,
  postIdSchema,
  publicPostsSchema,
  publicPostsByCategorySchema,
  publicPostsByPlatformSchema,
  updatePostCategorySchema,
  updatePostPlatformSchema,
  updatePostSchema,
} from './posts.schemas'

export const getAdminPosts = createServerFn({ method: 'GET' })
  .validator(listPostsSchema)
  .handler(async ({ data }) =>
    createSuccessResponse(
      await (await import('./posts.service.server')).listPosts(data),
    ),
  )
export const getAdminPost = createServerFn({ method: 'GET' })
  .validator(postIdSchema)
  .handler(async ({ data }) =>
    createSuccessResponse(
      await (await import('./posts.service.server')).getPost(data.id),
    ),
  )
export const createAdminPost = createServerFn({ method: 'POST' })
  .validator(createPostSchema)
  .handler(async ({ data }) =>
    createSuccessResponse(
      await (await import('./posts.service.server')).createPost(data),
    ),
  )
export const updateAdminPost = createServerFn({ method: 'POST' })
  .validator(updatePostSchema)
  .handler(async ({ data }) =>
    createSuccessResponse(
      await (await import('./posts.service.server')).updatePost(data),
    ),
  )
export const getAdminPostCategories = createServerFn({ method: 'GET' })
  .validator(listPostCategoriesSchema)
  .handler(async ({ data }) =>
    createSuccessResponse(
      await (await import('./posts.service.server')).listPostCategories(data),
    ),
  )
export const getAdminPostPlatforms = createServerFn({ method: 'GET' })
  .validator(listPostPlatformsSchema)
  .handler(async () =>
    createSuccessResponse(
      await (await import('./posts.service.server')).listPostPlatforms(),
    ),
  )
export const createAdminPostCategory = createServerFn({ method: 'POST' })
  .validator(createPostCategorySchema)
  .handler(async ({ data }) =>
    createSuccessResponse(
      await (await import('./posts.service.server')).createPostCategory(data),
    ),
  )
export const createAdminPostPlatform = createServerFn({ method: 'POST' })
  .validator(createPostPlatformSchema)
  .handler(async ({ data }) =>
    createSuccessResponse(
      await (await import('./posts.service.server')).createPostPlatform(data),
    ),
  )
export const updateAdminPostPlatform = createServerFn({ method: 'POST' })
  .validator(updatePostPlatformSchema)
  .handler(async ({ data }) =>
    createSuccessResponse(
      await (await import('./posts.service.server')).updatePostPlatform(data),
    ),
  )
export const deleteAdminPostPlatform = createServerFn({ method: 'POST' })
  .validator(postIdSchema)
  .handler(async ({ data }) =>
    createSuccessResponse(
      await (await import('./posts.service.server')).deletePostPlatform(data.id),
    ),
  )
export const updateAdminPostCategory = createServerFn({ method: 'POST' })
  .validator(updatePostCategorySchema)
  .handler(async ({ data }) =>
    createSuccessResponse(
      await (await import('./posts.service.server')).updatePostCategory(data),
    ),
  )
export const deleteAdminPostCategory = createServerFn({ method: 'POST' })
  .validator(postIdSchema)
  .handler(async ({ data }) =>
    createSuccessResponse(
      await (
        await import('./posts.service.server')
      ).deletePostCategory(data.id),
    ),
  )
export const getPublicPostBySlug = createServerFn({ method: 'GET' })
  .validator((input: { slug: string }) => ({ slug: input.slug.trim() }))
  .handler(async ({ data }) =>
    (await import('./posts.service.server')).getPublicPost(data.slug),
  )
export const getPublicPosts = createServerFn({ method: 'GET' })
  .validator(publicPostsSchema)
  .handler(async ({ data }) =>
    (await import('./posts.service.server')).listPublicPosts(data),
  )
export const getPublicPostsByCategory = createServerFn({ method: 'GET' })
  .validator(publicPostsByCategorySchema)
  .handler(async ({ data }) =>
    (await import('./posts.service.server')).listPublicPosts(data),
  )
export const getPublicPostsByPlatform = createServerFn({ method: 'GET' })
  .validator(publicPostsByPlatformSchema)
  .handler(async ({ data }) =>
    (await import('./posts.service.server')).listPublicPosts(data),
  )
