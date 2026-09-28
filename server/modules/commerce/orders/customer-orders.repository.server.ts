import { prisma } from '../../../db/prisma'
import type { Prisma } from '../../../../prisma/generated/client.js'
import type { ListCustomerOrdersInput } from './customer-orders.schemas'

function ownedOrdersWhere(
  userId: string,
  input: ListCustomerOrdersInput,
): Prisma.OrderWhereInput {
  const search = input.search?.trim()
  return {
    userId,
    ...(input.status ? { status: input.status } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: 'insensitive' } },
            {
              items: {
                some: {
                  product: { name: { contains: search, mode: 'insensitive' } },
                },
              },
            },
          ],
        }
      : {}),
  }
}

export function listCustomerOrderRecords(
  userId: string,
  input: ListCustomerOrdersInput,
) {
  return prisma.order.findMany({
    where: ownedOrdersWhere(userId, input),
    orderBy: [
      { createdAt: input.sort === 'OLDEST' ? 'asc' : 'desc' },
      { id: 'desc' },
    ],
    skip: (input.page - 1) * input.limit,
    take: input.limit,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      currency: true,
      paymentMethod: true,
      subtotalMinor: true,
      discountMinor: true,
      taxMinor: true,
      totalMinor: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          quantity: true,
          totalAmountMinor: true,
          product: {
            select: {
              name: true,
              category: { select: { name: true, slug: true } },
            },
          },
          plan: { select: { name: true } },
        },
      },
    },
  })
}

export function countCustomerOrders(
  userId: string,
  input: ListCustomerOrdersInput,
) {
  return prisma.order.count({ where: ownedOrdersWhere(userId, input) })
}

export function countCustomerOrdersByStatus(userId: string) {
  return prisma.order.groupBy({
    by: ['status'],
    where: { userId },
    _count: { _all: true },
  })
}
