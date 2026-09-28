import { prisma } from '../../../db/prisma'
import type { Prisma } from '../../../../prisma/generated/client.js'
import type { ListMyCustomerServicesInput } from './customer-services.schemas'

const customerServiceInclude = {
  product: {
    select: {
      id: true,
      code: true,
      name: true,
      category: { select: { id: true, slug: true, name: true } },
      providerCategory: { select: { id: true, name: true } },
    },
  },
  plan: { select: { id: true, code: true, name: true, features: true } },
  orderItem: {
    select: {
      unitAmountMinor: true,
      totalAmountMinor: true,
      quantity: true,
      configuration: true,
      order: { select: { currency: true, orderNumber: true, status: true } },
    },
  },
  resource: {
    select: {
      id: true,
      resourceType: true,
      externalId: true,
      status: true,
      provider: { select: { id: true, code: true } },
      datacenter: {
        select: { code: true, name: true, countryCode: true, city: true },
      },
    },
  },
} as const

function ownershipWhere(userId: string): Prisma.CustomerServiceWhereInput {
  return {
    OR: [
      { organization: { memberships: { some: { userId, status: 'ACTIVE' } } } },
      { orderItem: { order: { userId } } },
    ],
  }
}

function filteredWhere(
  userId: string,
  input: ListMyCustomerServicesInput,
): Prisma.CustomerServiceWhereInput {
  const search = input.search?.trim()
  return {
    AND: [
      ownershipWhere(userId),
      ...(input.category
        ? [{ product: { category: { slug: input.category } } }]
        : []),
      ...(input.providerId
        ? [
            {
              OR: [
                { product: { providerCategoryId: input.providerId } },
                { resource: { providerId: input.providerId } },
              ],
            },
          ]
        : []),
      ...(input.status ? [{ status: input.status }] : []),
      ...(search
        ? [
            {
              OR: [
                {
                  serviceCode: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  product: {
                    name: { contains: search, mode: 'insensitive' as const },
                  },
                },
                {
                  resource: {
                    externalId: {
                      contains: search,
                      mode: 'insensitive' as const,
                    },
                  },
                },
                {
                  domains: {
                    some: {
                      domainName: {
                        contains: search,
                        mode: 'insensitive' as const,
                      },
                    },
                  },
                },
                {
                  configuration: {
                    path: ['ipAddress'],
                    string_contains: search,
                  },
                },
                {
                  configuration: {
                    path: ['hostname'],
                    string_contains: search,
                  },
                },
              ],
            },
          ]
        : []),
    ],
  }
}

export function countMyCustomerServices(
  userId: string,
  input: ListMyCustomerServicesInput,
) {
  return prisma.customerService.count({ where: filteredWhere(userId, input) })
}

export function listMyCustomerServiceRecords(
  userId: string,
  input: ListMyCustomerServicesInput,
) {
  const orderBy: Prisma.CustomerServiceOrderByWithRelationInput =
    input.sort === 'OLDEST'
      ? { createdAt: 'asc' }
      : input.sort === 'EXPIRING'
        ? { expiresAt: { sort: 'asc', nulls: 'last' } }
        : { createdAt: 'desc' }
  return prisma.customerService.findMany({
    where: filteredWhere(userId, input),
    orderBy: [orderBy, { id: 'desc' }],
    skip: (input.page - 1) * input.limit,
    take: input.limit,
    include: customerServiceInclude,
  })
}

export function listMyServiceCategoryCounts(userId: string) {
  return prisma.customerService.findMany({
    where: ownershipWhere(userId),
    select: {
      product: {
        select: {
          category: { select: { slug: true } },
          providerCategory: { select: { id: true, name: true } },
        },
      },
      resource: { select: { provider: { select: { id: true, code: true } } } },
    },
  })
}

export function listServiceCategories() {
  return prisma.productCategory.findMany({
    where: { kind: 'SERVICE', deletedAt: null },
    select: { slug: true, name: true },
    orderBy: { name: 'asc' },
  })
}

export function findMyCustomerServiceRecord(userId: string, id: string) {
  return prisma.customerService.findFirst({
    where: { AND: [ownershipWhere(userId), { id }] },
    include: {
      ...customerServiceInclude,
      events: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          eventType: true,
          fromStatus: true,
          toStatus: true,
          createdAt: true,
        },
      },
      actions: {
        orderBy: { requestedAt: 'desc' },
        take: 20,
        select: {
          id: true,
          action: true,
          status: true,
          requestedAt: true,
          completedAt: true,
        },
      },
      domains: { select: { id: true, domainName: true, status: true } },
    },
  })
}
