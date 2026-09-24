import { prisma } from '../../../db/prisma'
import type { ListMyCustomerServicesInput } from './customer-services.schemas'

const customerServiceInclude = {
  product: { select: { id: true, code: true, category: true, name: true } },
  plan: { select: { id: true, code: true, name: true, features: true } },
  resource: {
    select: {
      id: true,
      resourceType: true,
      externalId: true,
      status: true,
      datacenter: {
        select: { code: true, name: true, countryCode: true, city: true },
      },
    },
  },
} as const

export function countMyCustomerServices(
  userId: string,
  input: ListMyCustomerServicesInput,
) {
  return prisma.customerService.count({
    where: {
      organization: {
        memberships: { some: { userId, status: 'ACTIVE' } },
      },
      ...(input.status ? { status: input.status } : {}),
    },
  })
}

export function listMyCustomerServiceRecords(
  userId: string,
  input: ListMyCustomerServicesInput,
) {
  return prisma.customerService.findMany({
    where: {
      organization: {
        memberships: { some: { userId, status: 'ACTIVE' } },
      },
      ...(input.status ? { status: input.status } : {}),
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    skip: (input.page - 1) * input.limit,
    take: input.limit,
    include: customerServiceInclude,
  })
}

export function findMyCustomerServiceRecord(userId: string, id: string) {
  return prisma.customerService.findFirst({
    where: {
      id,
      organization: {
        memberships: { some: { userId, status: 'ACTIVE' } },
      },
    },
    include: {
      ...customerServiceInclude,
      events: { orderBy: { createdAt: 'desc' }, take: 50 },
      actions: { orderBy: { requestedAt: 'desc' }, take: 50 },
      domains: { include: { records: true } },
      proxyAllocations: true,
      viaAccounts: {
        select: {
          id: true,
          accountType: true,
          countryCode: true,
          status: true,
          expiresAt: true,
        },
      },
    },
  })
}
