import { prisma } from '../../../db/prisma'
import { createId } from '../../../common/id.server'

export function findPurchasablePlan(input: {
  productId: string
  planId: string
  billingCycle: string
  now: Date
}) {
  return prisma.plan.findFirst({
    where: {
      id: input.planId,
      productId: input.productId,
      status: 'ACTIVE',
      product: {
        status: 'ACTIVE',
        category: { kind: 'SERVICE', deletedAt: null },
      },
    },
    include: {
      product: {
        include: {
          category: { select: { slug: true } },
          metas: {
            where: { metaKey: { in: ['datacenterIds', 'operatingSystem'] } },
          },
        },
      },
      prices: {
        where: {
          billingCycle: input.billingCycle,
          status: 'ACTIVE',
          currency: 'VND',
          effectiveFrom: { lte: input.now },
          OR: [{ effectiveTo: null }, { effectiveTo: { gt: input.now } }],
        },
        orderBy: { effectiveFrom: 'desc' },
        take: 1,
      },
    },
  })
}

export function findActiveDatacenter(id: string) {
  return prisma.datacenter.findFirst({
    where: { id, status: 'ACTIVE' },
    select: { id: true },
  })
}

export function findActiveCustomerCart(userId: string) {
  return prisma.cart.findFirst({
    where: { userId, status: 'ACTIVE', currency: 'VND' },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        orderBy: { createdAt: 'asc' },
        include: {
          product: {
            select: {
              name: true,
              description: true,
              status: true,
              category: { select: { name: true, slug: true, deletedAt: true } },
              metas: {
                where: {
                  metaKey: {
                    in: ['datacenterIds', 'featured', 'operatingSystem'],
                  },
                },
                select: { metaKey: true, metaValue: true },
              },
            },
          },
          plan: {
            select: {
              name: true,
              status: true,
              features: true,
              prices: {
                where: { status: 'ACTIVE', currency: 'VND' },
                orderBy: { effectiveFrom: 'desc' },
              },
            },
          },
        },
      },
    },
  })
}

export function findCartDatacenters(ids: string[]) {
  return prisma.datacenter.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, status: true },
  })
}

export function addItemToActiveCart(input: {
  userId: string
  productId: string
  planId: string
  billingCycle: string
  datacenterId?: string
}) {
  return prisma.$transaction(async (tx) => {
    let cart = await tx.cart.findFirst({
      where: { userId: input.userId, status: 'ACTIVE', currency: 'VND' },
      orderBy: { createdAt: 'desc' },
    })
    if (!cart)
      cart = await tx.cart.create({
        data: {
          id: createId(),
          userId: input.userId,
          status: 'ACTIVE',
          currency: 'VND',
        },
      })
    const item = await tx.cartItem.create({
      data: {
        id: createId(),
        cartId: cart.id,
        productId: input.productId,
        planId: input.planId,
        quantity: 1,
        configuration: {
          billingCycle: input.billingCycle,
          ...(input.datacenterId ? { datacenterId: input.datacenterId } : {}),
        },
      },
    })
    return { cartId: cart.id, itemId: item.id }
  })
}

export function removeItemFromCustomerCart(userId: string, itemId: string) {
  return prisma.cartItem.deleteMany({
    where: { id: itemId, cart: { userId, status: 'ACTIVE' } },
  })
}

export function findOwnedActiveCartItem(userId: string, itemId: string) {
  return prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId, status: 'ACTIVE' } },
    select: { id: true, productId: true, planId: true, configuration: true },
  })
}

export function updateOwnedCartItem(
  userId: string,
  input: {
    id: string
    quantity: number
    billingCycle: string
    datacenterId?: string | null
    operatingSystem?: string
  },
) {
  return prisma.cartItem.updateMany({
    where: { id: input.id, cart: { userId, status: 'ACTIVE' } },
    data: {
      quantity: input.quantity,
      configuration: {
        billingCycle: input.billingCycle,
        ...(input.datacenterId ? { datacenterId: input.datacenterId } : {}),
        ...(input.operatingSystem
          ? { operatingSystem: input.operatingSystem }
          : {}),
      },
    },
  })
}

export function clearActiveCustomerCart(userId: string) {
  return prisma.cartItem.deleteMany({
    where: { cart: { userId, status: 'ACTIVE' } },
  })
}

export function setActiveCartCoupon(userId: string, couponCode: string | null) {
  return prisma.cart.updateMany({
    where: { userId, status: 'ACTIVE', currency: 'VND' },
    data: { couponCode },
  })
}
