import { prisma } from '../../../db/prisma'

export function listActiveServiceCategories() {
  return prisma.productCategory.findMany({
    where: { kind: 'SERVICE', deletedAt: null },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      imageUrl: true,
    },
  })
}

export function listActiveProductsByCategory(categorySlug: string, now: Date) {
  return prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      category: { slug: categorySlug, kind: 'SERVICE', deletedAt: null },
    },
    take: 100,
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    include: {
      metas: {
        where: {
          metaKey: { in: ['featured', 'displayOrder', 'datacenterIds'] },
        },
      },
      plans: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
        include: {
          prices: {
            where: {
              status: 'ACTIVE',
              currency: 'VND',
              effectiveFrom: { lte: now },
              OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
            },
            orderBy: { effectiveFrom: 'desc' },
          },
        },
      },
    },
  })
}

export function listActiveDatacenters(ids: string[]) {
  return prisma.datacenter.findMany({
    where: { id: { in: ids }, status: 'ACTIVE' },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, city: true, countryCode: true },
  })
}
