import { Prisma } from '../../../../prisma/generated/client.js'
import { prisma } from '../../../db/prisma'
import { createId } from '../../../common/id.server'
import { createAppError } from '../../../common/app-error.server'
import { requireCustomer } from '../../identity/auth/customer-access.server'
import { calculateCheckoutTotals } from '../../billing/invoices/checkout-pricing'
import { availableVpsOperatingSystems } from '../../../../shared/catalog/vps-operating-systems'
import {
  calculateCouponDiscount,
  normalizeCouponCode,
} from '../coupons/coupon.service.server'
import {
  countCustomerOrders,
  countCustomerOrdersByStatus,
  listCustomerOrderRecords,
} from './customer-orders.repository.server'
import type {
  CreatePendingOrderInput,
  ListCustomerOrdersInput,
} from './customer-orders.schemas'

function invalidOrder(message: string) {
  return createAppError({
    message,
    errorCode: 'ORDER_INVALID_CART',
    statusCode: 400,
  })
}

export async function createPendingOrder(input: CreatePendingOrderInput) {
  const user = await requireCustomer()
  const existing = await prisma.order.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  })
  if (existing) {
    if (existing.userId !== user.id)
      throw invalidOrder('Mã yêu cầu đã được sử dụng')
    return {
      id: existing.id,
      orderNumber: existing.orderNumber,
      status: existing.status,
    }
  }

  try {
    return await prisma.$transaction(
      async (tx) => {
        const cart = await tx.cart.findFirst({
          where: { userId: user.id, status: 'ACTIVE', currency: 'VND' },
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                    metas: {
                      where: {
                        metaKey: { in: ['datacenterIds', 'operatingSystem'] },
                      },
                    },
                  },
                },
                plan: { include: { prices: true } },
              },
            },
          },
        })
        if (!cart?.items.length) throw invalidOrder('Giỏ hàng trống')
        const now = new Date()
        let subtotalMinor = 0n
        const orderItems = await Promise.all(
          cart.items.map(async (item) => {
            const config =
              item.configuration &&
              typeof item.configuration === 'object' &&
              !Array.isArray(item.configuration)
                ? (item.configuration as Record<string, unknown>)
                : {}
            const billingCycle =
              typeof config.billingCycle === 'string' ? config.billingCycle : ''
            if (
              item.quantity < 1 ||
              item.quantity > 100 ||
              !item.plan ||
              item.plan.status !== 'ACTIVE' ||
              item.product.status !== 'ACTIVE' ||
              item.product.category.kind !== 'SERVICE' ||
              item.product.category.deletedAt
            ) {
              throw invalidOrder('Một gói dịch vụ không còn khả dụng')
            }
            const price = item.plan.prices
              .filter(
                (candidate) =>
                  candidate.status === 'ACTIVE' &&
                  candidate.currency === 'VND' &&
                  candidate.billingCycle === billingCycle &&
                  candidate.effectiveFrom <= now &&
                  (!candidate.effectiveTo || candidate.effectiveTo > now),
              )
              .sort(
                (a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime(),
              )[0]
            if (!price)
              throw invalidOrder(
                'Giá gói đã thay đổi, vui lòng kiểm tra giỏ hàng',
              )
            const assignedIds = item.product.metas.flatMap((meta) =>
              meta.metaKey === 'datacenterIds' && Array.isArray(meta.metaValue)
                ? meta.metaValue.filter(
                    (id): id is string => typeof id === 'string',
                  )
                : [],
            )
            const datacenterId =
              typeof config.datacenterId === 'string'
                ? config.datacenterId
                : null
            if (item.product.category.slug === 'vps' && !assignedIds.length)
              throw invalidOrder('Gói VPS chưa có datacenter')
            if (
              assignedIds.length &&
              (!datacenterId || !assignedIds.includes(datacenterId))
            )
              throw invalidOrder('Vị trí datacenter không còn khả dụng')
            if (!assignedIds.length && datacenterId)
              throw invalidOrder('Gói không hỗ trợ vị trí datacenter')
            if (
              datacenterId &&
              !(await tx.datacenter.findFirst({
                where: { id: datacenterId, status: 'ACTIVE' },
                select: { id: true },
              }))
            )
              throw invalidOrder('Datacenter không còn hoạt động')
            const extra = input.configurations.find(
              (candidate) => candidate.cartItemId === item.id,
            )
            const configuredOs = item.product.metas.find(
              (meta) => meta.metaKey === 'operatingSystem',
            )?.metaValue
            const defaultOs =
              typeof configuredOs === 'string' ? configuredOs : undefined
            const savedOs =
              typeof config.operatingSystem === 'string'
                ? config.operatingSystem
                : undefined
            const selectedOs = extra?.operatingSystem ?? savedOs ?? defaultOs
            if (item.product.category.slug === 'vps') {
              if (
                !selectedOs ||
                !availableVpsOperatingSystems(defaultOs).includes(selectedOs)
              )
                throw invalidOrder('Hệ điều hành không khả dụng cho gói VPS')
            } else if (extra?.operatingSystem || savedOs) {
              throw invalidOrder('Gói này không hỗ trợ hệ điều hành')
            }
            if (
              selectedOs?.startsWith('N8N') &&
              !extra?.hostname?.includes('.')
            )
              throw invalidOrder('N8N yêu cầu hostname là tên miền đầy đủ')
            const unitAmountMinor = price.amountMinor + price.setupFeeMinor
            const totalAmountMinor = unitAmountMinor * BigInt(item.quantity)
            subtotalMinor += totalAmountMinor
            return {
              id: createId(),
              productId: item.productId,
              planId: item.planId,
              quantity: item.quantity,
              unitAmountMinor,
              totalAmountMinor,
              configuration: {
                ...config,
                ...(item.product.category.slug === 'vps' && selectedOs
                  ? { operatingSystem: selectedOs }
                  : {}),
                ...(extra?.hostname ? { hostname: extra.hostname } : {}),
              } as Prisma.InputJsonValue,
            }
          }),
        )
        const invalidConfiguration = input.configurations.some(
          (entry) => !cart.items.some((item) => item.id === entry.cartItemId),
        )
        if (invalidConfiguration)
          throw invalidOrder('Cấu hình dịch vụ không khớp giỏ hàng')
        let discountMinor = 0n
        if (cart.couponCode) {
          const coupon = await tx.coupon.findUnique({
            where: { code: normalizeCouponCode(cart.couponCode) },
          })
          if (
            !coupon ||
            coupon.status !== 'ACTIVE' ||
            coupon.startsAt > now ||
            (coupon.endsAt && coupon.endsAt <= now) ||
            (coupon.usageLimit !== null &&
              coupon.usedCount >= coupon.usageLimit)
          )
            throw invalidOrder('Mã giảm giá không còn khả dụng')
          const discount = calculateCouponDiscount(
            coupon.discountType,
            coupon.discountValue,
            subtotalMinor,
          )
          if (discount === null)
            throw invalidOrder('Loại mã giảm giá chưa được hỗ trợ')
          discountMinor = discount
          // TODO(payment): Chỉ tăng coupon.usedCount sau webhook thanh toán thành công.
        }
        const totals = calculateCheckoutTotals(subtotalMinor, discountMinor)
        const orderId = createId()
        const orderNumber = `HF-${orderId.replaceAll('-', '').slice(0, 16).toUpperCase()}`
        const claimed = await tx.cart.updateMany({
          where: { id: cart.id, userId: user.id, status: 'ACTIVE' },
          data: { status: 'CHECKED_OUT' },
        })
        if (claimed.count !== 1) throw invalidOrder('Giỏ hàng đã được đặt hàng')
        const order = await tx.order.create({
          data: {
            id: orderId,
            orderNumber,
            userId: user.id,
            organizationId: cart.organizationId,
            status: 'PENDING_PAYMENT',
            currency: 'VND',
            paymentMethod: input.paymentMethod,
            couponCode: cart.couponCode,
            customerNote: input.customerNote || null,
            termsAcceptedAt: now,
            idempotencyKey: input.idempotencyKey,
            subtotalMinor: totals.subtotalMinor,
            discountMinor: totals.discountMinor,
            taxMinor: totals.taxMinor,
            totalMinor: totals.totalMinor,
            items: { create: orderItems },
          },
        })
        // TODO(payment): Tạo payment intent/QR ở adapter cổng được chọn; xác thực webhook,
        // cập nhật invoice/order PAID và khởi chạy provisioning chỉ sau xác nhận giao dịch.
        // Hiện tại không trừ ví, không gọi cổng và không ghi nhận giao dịch đã thanh toán.
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const previous = await prisma.order.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      })
      if (previous?.userId === user.id)
        return {
          id: previous.id,
          orderNumber: previous.orderNumber,
          status: previous.status,
        }
    }
    throw error
  }
}

export async function getCustomerOrder(id: string) {
  const user = await requireCustomer()
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: {
      items: {
        include: {
          product: { select: { name: true } },
          plan: { select: { name: true } },
        },
      },
    },
  })
  if (!order)
    throw createAppError({
      message: 'Không tìm thấy đơn hàng',
      errorCode: 'ORDER_NOT_FOUND',
      statusCode: 404,
    })
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    couponCode: order.couponCode,
    customerNote: order.customerNote,
    createdAt: order.createdAt.toISOString(),
    subtotalMinor: Number(order.subtotalMinor),
    discountMinor: Number(order.discountMinor),
    taxMinor: Number(order.taxMinor),
    totalMinor: Number(order.totalMinor),
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.product.name,
      planName: item.plan?.name ?? '',
      quantity: item.quantity,
      totalMinor: Number(item.totalAmountMinor),
      configuration: item.configuration,
    })),
  }
}

export async function listCustomerOrders(input: ListCustomerOrdersInput) {
  const user = await requireCustomer()
  const [records, total, statusCounts] = await Promise.all([
    listCustomerOrderRecords(user.id, input),
    countCustomerOrders(user.id, input),
    countCustomerOrdersByStatus(user.id),
  ])
  const counts = Object.fromEntries(
    statusCounts.map((entry) => [entry.status, entry._count._all]),
  )
  const totalPages = Math.ceil(total / input.limit)
  return {
    items: records.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      subtotalMinor: Number(order.subtotalMinor),
      discountMinor: Number(order.discountMinor),
      taxMinor: Number(order.taxMinor),
      totalMinor: Number(order.totalMinor),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.product.name,
        categoryName: item.product.category.name,
        categorySlug: item.product.category.slug,
        planName: item.plan?.name ?? null,
        quantity: item.quantity,
        totalMinor: Number(item.totalAmountMinor),
      })),
    })),
    statusCounts: counts,
    totalOrders: statusCounts.reduce(
      (sum, entry) => sum + entry._count._all,
      0,
    ),
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
