import { prisma } from '../../../db/prisma'
import type { ListCatalogProductsInput } from './products.schemas'

export function listCatalogProductRecords(input: ListCatalogProductsInput) {
  const status = input.includeArchived
    ? { in: ['DRAFT', 'ACTIVE', 'ARCHIVED'] }
    : 'ACTIVE'

  return prisma.product.findMany({
    where: {
      status,
      ...(input.category ? { category: { slug: input.category.toLowerCase(), kind: 'SERVICE', deletedAt: null } } : {}),
      ...(input.search
        ? {
            OR: [
              { name: { contains: input.search, mode: 'insensitive' } },
              { code: { contains: input.search, mode: 'insensitive' } },
              { description: { contains: input.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
    include: {
      plans: {
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
        include: {
          prices: {
            where: { status: 'ACTIVE' },
            orderBy: { effectiveFrom: 'desc' },
          },
        },
      },
      addons: {
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
      },
      category: { select: { id: true, name: true, slug: true, parentId: true } },
      metas: { where: { isPublic: true }, select: { metaKey: true, metaValue: true } },
    },
  })
}

export function findCatalogProductRecord(id: string) {
  return prisma.product.findFirst({
    where: { id, status: 'ACTIVE' },
    include: {
      plans: {
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
        include: {
          prices: {
            where: { status: 'ACTIVE' },
            orderBy: { effectiveFrom: 'desc' },
          },
        },
      },
      addons: {
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
      },
      category: { select: { id: true, name: true, slug: true, parentId: true } },
      metas: { where: { isPublic: true }, select: { metaKey: true, metaValue: true } },
    },
  })
}
