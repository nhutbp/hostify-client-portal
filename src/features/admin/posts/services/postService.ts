import {
  createAdminPost,
  createAdminPostCategory,
  createAdminPostPlatform,
  deleteAdminPostPlatform,
  deleteAdminPostCategory,
  getAdminPost,
  getAdminPostCategories,
  getAdminPostPlatforms,
  getAdminPosts,
  updateAdminPost,
  updateAdminPostCategory,
  updateAdminPostPlatform,
} from '../../../../../server/modules/posts/posts'
import type {
  CreatePostCategoryInput,
  CreatePostInput,
  ListPostCategoriesInput,
  ListPostsInput,
  UpdatePostCategoryInput,
  UpdatePostInput,
  CreatePostPlatformInput,
  UpdatePostPlatformInput,
} from '../../../../../server/modules/posts/posts.schemas'
import { unwrapSuccessResponse } from '@/utils/response'

export type {
  CreatePostCategoryInput,
  CreatePostInput,
  ListPostCategoriesInput,
  ListPostsInput,
  UpdatePostCategoryInput,
  UpdatePostInput,
  CreatePostPlatformInput,
  UpdatePostPlatformInput,
} from '../../../../../server/modules/posts/posts.schemas'
export type PostPlatform = {
  id: string
  name: string
  slug: string
  description?: string | null
  _count?: { posts: number }
}
export const postService = {
  list: (input: ListPostsInput) =>
    getAdminPosts({ data: input }).then(unwrapSuccessResponse),
  detail: (id: string) =>
    getAdminPost({ data: { id } }).then(unwrapSuccessResponse),
  create: (input: CreatePostInput) =>
    createAdminPost({ data: input }).then(unwrapSuccessResponse),
  update: (input: UpdatePostInput) =>
    updateAdminPost({ data: input }).then(unwrapSuccessResponse),
  categories: (input: ListPostCategoriesInput) =>
    getAdminPostCategories({ data: input }).then(unwrapSuccessResponse),
  platforms: () =>
    getAdminPostPlatforms({ data: {} }).then(unwrapSuccessResponse),
  createPlatform: (input: CreatePostPlatformInput) =>
    createAdminPostPlatform({ data: input }).then(unwrapSuccessResponse),
  updatePlatform: (input: UpdatePostPlatformInput) =>
    updateAdminPostPlatform({ data: input }).then(unwrapSuccessResponse),
  deletePlatform: (id: string) =>
    deleteAdminPostPlatform({ data: { id } }).then(unwrapSuccessResponse),
  createCategory: (input: CreatePostCategoryInput) =>
    createAdminPostCategory({ data: input }).then(unwrapSuccessResponse),
  updateCategory: (input: UpdatePostCategoryInput) =>
    updateAdminPostCategory({ data: input }).then(unwrapSuccessResponse),
  deleteCategory: (id: string) =>
    deleteAdminPostCategory({ data: { id } }).then(unwrapSuccessResponse),
}
