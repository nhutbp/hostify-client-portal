import type { Prisma } from '../../../prisma/generated/client.js'
import { createId } from '../../common/id.server'
import { prisma } from '../../db/prisma'
import type {
  CreatePostCategoryInput,
  CreatePostInput,
  CreatePostPlatformInput,
  ListPostCategoriesInput,
  ListPostsInput,
  PublicPostsInput,
  UpdatePostCategoryInput,
  UpdatePostInput,
  UpdatePostPlatformInput,
} from './posts.schemas'

function postWhere(input: ListPostsInput): Prisma.PostWhereInput {
  return {
    deletedAt: null,
    ...(input.status ? { status: input.status } : {}),
    ...(input.categoryId
      ? { categories: { some: { categoryId: input.categoryId } } }
      : {}),
    ...(input.platformId
      ? { platforms: { some: { platformId: input.platformId } } }
      : {}),
    ...(input.search
      ? { title: { contains: input.search, mode: 'insensitive' } }
      : {}),
  }
}
export function listPostRecords(input: ListPostsInput) {
  return prisma.post.findMany({
    where: postWhere(input),
    orderBy: { updatedAt: 'desc' },
    skip: (input.page - 1) * input.limit,
    take: input.limit,
    include: {
      categories: {
        include: { category: { select: { id: true, name: true, slug: true } } },
      },
      platforms: {
        include: { platform: { select: { id: true, name: true, slug: true } } },
      },
    },
  })
}
export function countPosts(input: ListPostsInput) {
  return prisma.post.count({ where: postWhere(input) })
}
export function findPostById(id: string) {
  return prisma.post.findFirst({
    where: { id, deletedAt: null },
    include: {
      categories: { select: { categoryId: true } },
      platforms: { select: { platformId: true } },
      metas: { where: { metaKey: 'video_url' } },
    },
  })
}
export function findPublishedPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: { slug, status: 'PUBLISHED', visibility: 'PUBLIC', deletedAt: null },
    include: {
      categories: { include: { category: true } },
      platforms: { include: { platform: true } },
    },
  })
}
function publicPostWhere(input: PublicPostsInput): Prisma.PostWhereInput {
  return {
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    deletedAt: null,
    ...(input.categorySlug
      ? {
          categories: {
            some: { category: { slug: input.categorySlug, deletedAt: null } },
          },
        }
      : {}),
    ...(input.platformSlug
      ? {
          platforms: {
            some: { platform: { slug: input.platformSlug, deletedAt: null } },
          },
        }
      : {}),
  }
}
export function listPublicPostRecords(input: PublicPostsInput) {
  return prisma.post.findMany({
    where: publicPostWhere(input),
    orderBy: { publishedAt: 'desc' },
    skip: (input.page - 1) * input.limit,
    take: input.limit,
    include: {
      categories: {
        include: { category: { select: { name: true, slug: true } } },
      },
      platforms: {
        include: { platform: { select: { name: true, slug: true } } },
      },
    },
  })
}
export function countPublicPosts(input: PublicPostsInput) {
  return prisma.post.count({ where: publicPostWhere(input) })
}
export function listPublicPostCategoryRecords() {
  return prisma.postCategory.findMany({
    where: { deletedAt: null },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true, imageUrl: true },
  })
}
export function findPublicVideoPosts(limit = 4) {
  return prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      deletedAt: null,
      categories: {
        some: {
          category: { slug: 'video', deletedAt: null },
        },
      },
      metas: {
        some: { metaKey: 'video_url', isPublic: true },
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    include: {
      categories: {
        include: { category: { select: { name: true, slug: true } } },
      },
      metas: {
        where: { metaKey: 'video_url', isPublic: true },
        select: { metaValue: true },
      },
    },
  })
}
export function createPostRecord(input: CreatePostInput & { slug: string }) {
  return prisma.post.create({
    data: {
      id: createId(),
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      status: input.status,
      visibility: input.visibility,
      featuredImage: input.featuredImage,
      publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
      categories: {
        create: input.categoryIds.map((categoryId) => ({
          category: { connect: { id: categoryId } },
        })),
      },
      platforms: {
        create: input.platformIds.map((platformId) => ({
          platform: { connect: { id: platformId } },
        })),
      },
      metas: input.metaVideoUrl
        ? {
            create: {
              id: createId(),
              metaKey: 'video_url',
              metaValue: input.metaVideoUrl,
              valueType: 'url',
              isPublic: true,
            },
          }
        : undefined,
    },
    include: { categories: true, platforms: true, metas: true },
  })
}
export function updatePostRecord(input: UpdatePostInput & { slug: string }) {
  return prisma.post.update({
    where: { id: input.id },
    data: {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      status: input.status,
      visibility: input.visibility,
      featuredImage: input.featuredImage,
      publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
      categories: {
        deleteMany: {},
        create: input.categoryIds.map((categoryId) => ({
          category: { connect: { id: categoryId } },
        })),
      },
      platforms: {
        deleteMany: {},
        create: input.platformIds.map((platformId) => ({
          platform: { connect: { id: platformId } },
        })),
      },
      metas: {
        deleteMany: { metaKey: 'video_url' },
        ...(input.metaVideoUrl
          ? {
              create: {
                id: createId(),
                metaKey: 'video_url',
                metaValue: input.metaVideoUrl,
                valueType: 'url',
                isPublic: true,
              },
            }
          : {}),
      },
    },
    include: { categories: true, platforms: true },
  })
}
export function listPostCategoryRecords(input: ListPostCategoriesInput) {
  return prisma.postCategory.findMany({
    where: {
      deletedAt: null,
      ...(input.search
        ? { name: { contains: input.search, mode: 'insensitive' } }
        : {}),
    },
    orderBy: { name: 'asc' },
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { posts: true } },
    },
  })
}

export function listPostPlatformRecords() {
  return prisma.postPlatform.findMany({
    where: { deletedAt: null },
    orderBy: { name: 'asc' },
    include: { _count: { select: { posts: true } } },
  })
}
export function createPostPlatformRecord(
  input: CreatePostPlatformInput & { slug: string },
) {
  return prisma.postPlatform.create({
    data: {
      id: createId(),
      name: input.name,
      slug: input.slug,
      description: input.description,
    },
  })
}
export function updatePostPlatformRecord(
  input: UpdatePostPlatformInput & { slug: string },
) {
  return prisma.postPlatform.update({
    where: { id: input.id },
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
    },
  })
}
export function deletePostPlatformRecord(id: string) {
  return prisma.postPlatform.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}
export function countPostPlatformUsage(id: string) {
  return prisma.postPlatform.findUnique({
    where: { id },
    select: { _count: { select: { posts: true } } },
  })
}
export function createPostCategoryRecord(
  input: CreatePostCategoryInput & { slug: string },
) {
  return prisma.postCategory.create({
    data: {
      id: createId(),
      name: input.name,
      slug: input.slug,
      description: input.description,
      imageUrl: input.imageUrl,
      parentId: input.parentId,
    },
  })
}
export function updatePostCategoryRecord(
  input: UpdatePostCategoryInput & { slug: string },
) {
  return prisma.postCategory.update({
    where: { id: input.id },
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      imageUrl: input.imageUrl,
      parentId: input.parentId,
    },
  })
}
export function deletePostCategoryRecord(id: string) {
  return prisma.postCategory.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}
export function countPostCategoryUsage(id: string) {
  return prisma.postCategory.findUnique({
    where: { id },
    select: { _count: { select: { posts: true, children: true } } },
  })
}
