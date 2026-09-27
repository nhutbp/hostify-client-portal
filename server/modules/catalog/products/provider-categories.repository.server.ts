import { prisma } from '../../../db/prisma'
import { createId } from '../../../common/id.server'
import type {
  CreateProviderCategoryInput,
  ListProviderCategoriesInput,
  UpdateProviderCategoryInput,
} from './provider-categories.schemas'

const providerSelect = {
  id: true,
  parentId: true,
  parent: { select: { id: true, name: true } },
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  createdAt: true,
} as const

const providerChildWhere = {
  kind: 'PROVIDER',
  deletedAt: null,
  parent: { slug: 'nha-cung-cap', kind: 'PROVIDER', deletedAt: null },
} as const

export function findProviderCategoryRootRecord() {
  return prisma.productCategory.findFirst({
    where: {
      slug: 'nha-cung-cap',
      kind: 'PROVIDER',
      parentId: null,
      deletedAt: null,
    },
    select: { id: true, name: true },
  })
}

export function listProviderCategoryRecords(
  input: ListProviderCategoriesInput,
) {
  return prisma.productCategory.findMany({
    where: {
      ...providerChildWhere,
      ...(input.search
        ? {
            OR: [
              {
                name: { contains: input.search, mode: 'insensitive' as const },
              },
              {
                slug: { contains: input.search, mode: 'insensitive' as const },
              },
            ],
          }
        : {}),
    },
    select: providerSelect,
    orderBy: { name: 'asc' },
  })
}

export function findProviderCategoryRecord(id: string) {
  return prisma.productCategory.findFirst({
    where: { id, ...providerChildWhere },
    select: providerSelect,
  })
}

export function countProviderCategoryProducts(id: string) {
  return prisma.product.count({ where: { providerCategoryId: id } })
}

export function createProviderCategoryRecord(
  input: CreateProviderCategoryInput & { slug: string; rootId: string },
) {
  return prisma.productCategory.create({
    data: {
      id: createId(),
      kind: 'PROVIDER',
      parentId: input.rootId,
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      imageUrl: input.imageUrl || null,
    },
    select: providerSelect,
  })
}

export function updateProviderCategoryRecord(
  input: UpdateProviderCategoryInput & { slug: string; rootId: string },
) {
  return prisma.productCategory
    .findFirst({
      where: {
        id: input.id,
        kind: 'PROVIDER',
        deletedAt: null,
        parentId: input.rootId,
      },
      select: { id: true },
    })
    .then((existing) => {
      if (!existing) return null
      return prisma.productCategory.update({
        where: {
          id: existing.id,
          kind: 'PROVIDER',
          deletedAt: null,
          parentId: input.rootId,
        },
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description || null,
          imageUrl: input.imageUrl || null,
        },
        select: providerSelect,
      })
    })
}

export function deleteProviderCategoryRecord(id: string, rootId: string) {
  return prisma.productCategory
    .findFirst({
      where: { id, kind: 'PROVIDER', deletedAt: null, parentId: rootId },
      select: { id: true },
    })
    .then((existing) =>
      existing
        ? prisma.productCategory.update({
            where: {
              id: existing.id,
              kind: 'PROVIDER',
              deletedAt: null,
              parentId: rootId,
            },
            data: { deletedAt: new Date() },
            select: providerSelect,
          })
        : null,
    )
}
