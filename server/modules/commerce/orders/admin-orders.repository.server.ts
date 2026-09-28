import { prisma } from '../../../db/prisma'
import type { Prisma } from '../../../../prisma/generated/client.js'
import type { ListAdminOrdersInput } from './admin-orders.schemas'

function orderWhere(input: ListAdminOrdersInput): Prisma.OrderWhereInput {
  const search = input.search?.trim()
  const itemFilter: Prisma.OrderItemWhereInput = {
    ...(input.categoryId ? { product: { categoryId: input.categoryId } } : {}),
    ...(input.providerCategoryId
      ? {
          product: {
            ...((input.categoryId && { categoryId: input.categoryId }) || {}),
            providerCategoryId: input.providerCategoryId,
          },
        }
      : {}),
  }
  const hasItemFilter = Boolean(input.categoryId || input.providerCategoryId)
  return {
    ...(input.status ? { status: input.status } : {}),
    ...(hasItemFilter ? { items: { some: itemFilter } } : {}),
    ...(input.dateFrom || input.dateTo
      ? {
          createdAt: {
            ...(input.dateFrom
              ? { gte: new Date(`${input.dateFrom}T00:00:00.000Z`) }
              : {}),
            ...(input.dateTo
              ? {
                  lt: new Date(
                    new Date(`${input.dateTo}T00:00:00.000Z`).getTime() +
                      86_400_000,
                  ),
                }
              : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: 'insensitive' } },
            {
              user: {
                OR: [
                  { email: { contains: search, mode: 'insensitive' } },
                  { displayName: { contains: search, mode: 'insensitive' } },
                  {
                    userProfile: {
                      fullName: { contains: search, mode: 'insensitive' },
                    },
                  },
                ],
              },
            },
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

export async function findAdminOrders(input: ListAdminOrdersInput) {
  const where = orderWhere(input)
  const orderBy: Prisma.OrderOrderByWithRelationInput[] =
    input.sort === 'TOTAL_DESC'
      ? [{ totalMinor: 'desc' }, { id: 'desc' }]
      : input.sort === 'TOTAL_ASC'
        ? [{ totalMinor: 'asc' }, { id: 'desc' }]
        : [
            { createdAt: input.sort === 'OLDEST' ? 'asc' : 'desc' },
            { id: 'desc' },
          ]
  const [items, total, statusCounts, categories, providers] = await Promise.all(
    [
      prisma.order.findMany({
        where,
        orderBy,
        skip: (input.page - 1) * input.limit,
        take: input.limit,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          currency: true,
          totalMinor: true,
          createdAt: true,
          paymentMethod: true,
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              userProfile: { select: { fullName: true } },
            },
          },
          items: {
            select: {
              id: true,
              quantity: true,
              product: {
                select: {
                  name: true,
                  slug: true,
                  category: { select: { id: true, name: true, slug: true } },
                  providerCategory: { select: { id: true, name: true } },
                },
              },
              plan: { select: { name: true } },
            },
          },
        },
      }),
      prisma.order.count({ where }),
      prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.productCategory.findMany({
        where: { kind: 'SERVICE', deletedAt: null },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.productCategory.findMany({
        where: { kind: 'PROVIDER', deletedAt: null, parentId: { not: null } },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ],
  )
  return { items, total, statusCounts, categories, providers }
}
