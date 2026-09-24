import { createAppError } from '../../common/app-error.server'
import { requirePermission } from '../../common/auth-context.server'
import { prisma } from '../../db/prisma'
import { env, getEnv } from '../../common/env.server'
import {
  countPostCategoryUsage,
  countPostPlatformUsage,
  createPostCategoryRecord,
  createPostPlatformRecord,
  createPostRecord,
  countPosts,
  deletePostCategoryRecord,
  deletePostPlatformRecord,
  findPostById,
  findPublicVideoPosts,
  findPublishedPostBySlug,
  listPostCategoryRecords,
  listPostPlatformRecords,
  listPublicPostCategoryRecords,
  listPublicPostRecords,
  countPublicPosts,
  listPostRecords,
  updatePostCategoryRecord,
  updatePostPlatformRecord,
  updatePostRecord,
} from './posts.repository.server'
import type {
  CreatePostCategoryInput,
  CreatePostInput,
  CreatePostPlatformInput,
  ListPostCategoriesInput,
  ListPostsInput,
  UpdatePostCategoryInput,
  UpdatePostInput,
  UpdatePostPlatformInput,
  PublicPostsInput,
} from './posts.schemas'
import { POST_ERROR_CODES } from './posts.errors'
import { recordAuditLog } from '../../common/audit/audit.service.server'
import { AUDIT_TARGETS } from '../../common/audit/audit.constants'

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function resolvePostImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) return null
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl

  const baseUrl =
    getEnv('CMC_CDN_BASE_URL') ??
    getEnv('CDN_BASE_URL') ??
    getEnv('VITE_CDN_BASE_URL') ??
    env.appUrl
  return `${baseUrl.replace(/\/$/, '')}/${imageUrl.replace(/^\/+/, '')}`
}
export async function listPosts(input: ListPostsInput) {
  await requirePermission('post.post.view')
  const [items, total] = await Promise.all([
    listPostRecords(input),
    countPosts(input),
  ])
  const totalPages = Math.ceil(total / input.limit)
  return {
    items,
    meta: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages,
      hasPrevious: input.page > 1,
      hasNext: input.page < totalPages,
    },
  }
}
export async function getPost(id: string) {
  await requirePermission('post.post.view')
  const post = await findPostById(id)
  if (!post)
    throw createAppError({
      message: 'Không tìm thấy bài viết',
      errorCode: POST_ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    })
  return post
}
export async function getPublicPost(slug: string) {
  const post = await findPublishedPostBySlug(slug)
  if (!post)
    throw createAppError({
      message: 'Không tìm thấy bài viết',
      errorCode: POST_ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    })
  return { ...post, featuredImage: resolvePostImageUrl(post.featuredImage) }
}
export async function listPublicVideoPosts() {
  const posts = await findPublicVideoPosts()

  return posts.flatMap((post) => {
    const videoUrl = post.metas[0]?.metaValue
    if (typeof videoUrl !== 'string' || !videoUrl) return []

    return [
      {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        videoUrl,
        image: resolvePostImageUrl(post.featuredImage),
        category: post.categories[0]?.category.name,
        publishedAt: post.publishedAt?.toISOString() ?? null,
      },
    ]
  })
}
export async function listPublicPosts(input: PublicPostsInput) {
  const [posts, total, categories] = await Promise.all([
    listPublicPostRecords(input),
    countPublicPosts(input),
    listPublicPostCategoryRecords(),
  ])
  const totalPages = Math.ceil(total / input.limit)

  return {
    items: posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      image: resolvePostImageUrl(post.featuredImage),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      categories: post.categories.map(({ category }) => category),
      platforms: post.platforms.map(({ platform }) => platform),
    })),
    categories,
    meta: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages,
      hasPrevious: input.page > 1,
      hasNext: input.page < totalPages,
    },
  }
}
export async function createPost(input: CreatePostInput) {
  const { user } = await requirePermission('post.post.create')
  const post = await createPostRecord({
    ...input,
    slug: slugify(input.slug || input.title),
  })
  await recordAuditLog({
    actorUserId: user.id,
    module: AUDIT_TARGETS.POST.MODULE,
    resource: AUDIT_TARGETS.POST.POST,
    action: 'CREATE',
    entityId: post.id,
    after: { title: post.title, slug: post.slug, status: post.status },
    source: 'admin',
  })
  return post
}
export async function updatePost(input: UpdatePostInput) {
  const { user } = await requirePermission('post.post.update')
  const existing = await getPost(input.id)
  const post = await updatePostRecord({
    ...input,
    slug: slugify(input.slug || input.title),
  })
  await recordAuditLog({
    actorUserId: user.id,
    module: AUDIT_TARGETS.POST.MODULE,
    resource: AUDIT_TARGETS.POST.POST,
    action: 'UPDATE',
    entityId: post.id,
    before: {
      title: existing.title,
      slug: existing.slug,
      status: existing.status,
    },
    after: { title: post.title, slug: post.slug, status: post.status },
    source: 'admin',
  })
  return post
}
export async function listPostCategories(input: ListPostCategoriesInput) {
  await requirePermission('post.post_category.view')
  return listPostCategoryRecords(input)
}
export async function listPostPlatforms() {
  await requirePermission('post.post_platform.view')
  return listPostPlatformRecords()
}
export async function createPostPlatform(input: CreatePostPlatformInput) {
  const { user } = await requirePermission('post.post_platform.create')
  const platform = await createPostPlatformRecord({
    ...input,
    slug: slugify(input.slug || input.name),
  })
  await recordAuditLog({
    actorUserId: user.id,
    module: AUDIT_TARGETS.POST.MODULE,
    resource: AUDIT_TARGETS.POST.PLATFORM,
    action: 'CREATE',
    entityId: platform.id,
    after: { name: platform.name, slug: platform.slug },
    source: 'admin',
  })
  return platform
}
export async function updatePostPlatform(input: UpdatePostPlatformInput) {
  const { user } = await requirePermission('post.post_platform.update')
  const platform = await prisma.postPlatform.findFirst({
    where: { id: input.id, deletedAt: null },
  })
  if (!platform)
    throw createAppError({
      message: 'Không tìm thấy platform',
      errorCode: POST_ERROR_CODES.PLATFORM_NOT_FOUND,
      statusCode: 404,
    })
  const updated = await updatePostPlatformRecord({
    ...input,
    slug: slugify(input.slug || input.name),
  })
  await recordAuditLog({
    actorUserId: user.id,
    module: AUDIT_TARGETS.POST.MODULE,
    resource: AUDIT_TARGETS.POST.PLATFORM,
    action: 'UPDATE',
    entityId: updated.id,
    before: { name: platform.name, slug: platform.slug },
    after: { name: updated.name, slug: updated.slug },
    source: 'admin',
  })
  return updated
}
export async function deletePostPlatform(id: string) {
  const { user } = await requirePermission('post.post_platform.delete')
  const platform = await prisma.postPlatform.findFirst({
    where: { id, deletedAt: null },
  })
  if (!platform)
    throw createAppError({
      message: 'Không tìm thấy platform',
      errorCode: POST_ERROR_CODES.PLATFORM_NOT_FOUND,
      statusCode: 404,
    })
  const usage = await countPostPlatformUsage(id)
  if ((usage?._count.posts ?? 0) > 0)
    throw createAppError({
      message: 'Không thể xóa platform đang được sử dụng',
      errorCode: POST_ERROR_CODES.PLATFORM_IN_USE,
      statusCode: 409,
    })
  const result = await deletePostPlatformRecord(id)
  await recordAuditLog({
    actorUserId: user.id,
    module: AUDIT_TARGETS.POST.MODULE,
    resource: AUDIT_TARGETS.POST.PLATFORM,
    action: 'DELETE',
    entityId: id,
    before: { name: platform.name, slug: platform.slug },
    source: 'admin',
  })
  return result
}
export async function createPostCategory(input: CreatePostCategoryInput) {
  const { user } = await requirePermission('post.post_category.create')
  const category = await createPostCategoryRecord({
    ...input,
    slug: slugify(input.slug || input.name),
  })
  await recordAuditLog({
    actorUserId: user.id,
    module: AUDIT_TARGETS.POST.MODULE,
    resource: AUDIT_TARGETS.POST.CATEGORY,
    action: 'CREATE',
    entityId: category.id,
    after: { name: category.name, slug: category.slug },
    source: 'admin',
  })
  return category
}
export async function updatePostCategory(input: UpdatePostCategoryInput) {
  const { user } = await requirePermission('post.post_category.update')
  const category = await prisma.postCategory.findFirst({
    where: { id: input.id, deletedAt: null },
  })
  if (!category)
    throw createAppError({
      message: 'Không tìm thấy danh mục',
      errorCode: POST_ERROR_CODES.CATEGORY_NOT_FOUND,
      statusCode: 404,
    })
  if (input.parentId === input.id)
    throw createAppError({
      message: 'Danh mục cha không hợp lệ',
      errorCode: POST_ERROR_CODES.CATEGORY_INVALID_PARENT,
      statusCode: 400,
    })
  const updated = await updatePostCategoryRecord({
    ...input,
    slug: slugify(input.slug || input.name),
  })
  await recordAuditLog({
    actorUserId: user.id,
    module: AUDIT_TARGETS.POST.MODULE,
    resource: AUDIT_TARGETS.POST.CATEGORY,
    action: 'UPDATE',
    entityId: updated.id,
    before: { name: category.name, slug: category.slug },
    after: { name: updated.name, slug: updated.slug },
    source: 'admin',
  })
  return updated
}
export async function deletePostCategory(id: string) {
  const { user } = await requirePermission('post.post_category.delete')
  const category = await prisma.postCategory.findFirst({
    where: { id, deletedAt: null },
  })
  if (!category)
    throw createAppError({
      message: 'Không tìm thấy danh mục',
      errorCode: POST_ERROR_CODES.CATEGORY_NOT_FOUND,
      statusCode: 404,
    })
  const usage = await countPostCategoryUsage(id)
  if ((usage?._count.posts ?? 0) > 0 || (usage?._count.children ?? 0) > 0)
    throw createAppError({
      message: 'Không thể xóa danh mục đang được sử dụng',
      errorCode: POST_ERROR_CODES.CATEGORY_IN_USE,
      statusCode: 409,
    })
  const result = await deletePostCategoryRecord(id)
  await recordAuditLog({
    actorUserId: user.id,
    module: AUDIT_TARGETS.POST.MODULE,
    resource: AUDIT_TARGETS.POST.CATEGORY,
    action: 'DELETE',
    entityId: id,
    before: { name: category.name, slug: category.slug },
    source: 'admin',
  })
  return result
}
