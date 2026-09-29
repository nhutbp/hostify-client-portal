import { requirePermission } from '../../../common/auth-context.server'
import { createAppError } from '../../../common/app-error.server'
import { createPaginationMeta } from '../../../common/pagination.server'
import { prisma } from '../../../db/prisma'
import { Prisma } from '../../../../prisma/generated/client.js'
import { createId } from '../../../common/id.server'
import {
  findAdminOrderDetail,
  findAdminOrderOptions,
  findAdminOrders,
} from './admin-orders.repository.server'
import type {
  ListAdminOrdersInput,
  UpdateAdminOrderInput,
} from './admin-orders.schemas'

const transitions: Record<string, readonly string[]> = {
  PENDING_PAYMENT: ['PENDING_PAYMENT', 'PAID', 'COMPLETED', 'CANCELLED'],
  PAID: ['PAID', 'PROVISIONING', 'COMPLETED'],
  PROVISIONING: ['PROVISIONING', 'COMPLETED', 'FAILED'],
  FAILED: ['FAILED', 'PROVISIONING', 'COMPLETED'],
  COMPLETED: ['COMPLETED'],
  CANCELLED: ['CANCELLED'],
}

function invalidUpdate(message: string, statusCode = 400) {
  return createAppError({
    message,
    errorCode: 'ORDER_UPDATE_INVALID',
    statusCode,
  })
}

function addBillingPeriod(date: Date, configuration: Prisma.JsonValue) {
  const cycle =
    configuration &&
    typeof configuration === 'object' &&
    !Array.isArray(configuration)
      ? (configuration as Record<string, unknown>).billingCycle
      : null
  const months = { MONTHLY: 1, QUARTERLY: 3, SEMI_ANNUAL: 6, YEARLY: 12 }[
    String(cycle)
  ]
  if (!months) return null
  const result = new Date(date)
  const day = result.getUTCDate()
  result.setUTCDate(1)
  result.setUTCMonth(result.getUTCMonth() + months)
  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate()
  result.setUTCDate(Math.min(day, lastDay))
  return result
}

export async function updateAdminOrderDetails(input: UpdateAdminOrderInput) {
  const { user } = await requirePermission('commerce.order.update')
  if (!(transitions[input.expectedStatus] ?? []).includes(input.status))
    throw invalidUpdate('Không thể chuyển sang trạng thái này')
  if (
    input.status === 'COMPLETED' &&
    input.expectedStatus !== 'COMPLETED' &&
    !input.manualFulfillmentConfirmed
  )
    throw invalidUpdate(
      'Vui lòng xác nhận dịch vụ đã được bàn giao trước khi hoàn tất',
    )
  const firstPayment =
    input.expectedStatus === 'PENDING_PAYMENT' &&
    ['PAID', 'COMPLETED'].includes(input.status)
  if (
    firstPayment &&
    (!input.paymentMethod || !input.paymentReference?.trim() || !input.paidAt)
  )
    throw invalidUpdate(
      'Cần phương thức, mã tham chiếu và thời gian thanh toán để xác nhận',
    )
  if (input.paidAt && new Date(input.paidAt).getTime() > Date.now() + 60_000)
    throw invalidUpdate('Thời gian thanh toán không được ở tương lai')

  return prisma.$transaction(
    async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: input.id },
        include: {
          items: { include: { customerService: true } },
          invoices: { include: { payments: true } },
        },
      })
      if (!order) throw invalidUpdate('Không tìm thấy đơn hàng', 404)
      if (order.status !== input.expectedStatus)
        throw invalidUpdate('Đơn hàng đã được cập nhật; vui lòng tải lại', 409)
      if (
        order.status !== 'PENDING_PAYMENT' &&
        input.paymentMethod !== order.paymentMethod
      )
        throw invalidUpdate(
          'Không thể đổi phương thức sau khi ghi nhận thanh toán',
        )
      if (
        order.status === input.status &&
        order.paymentMethod === input.paymentMethod
      )
        return { id: order.id, status: order.status }
      if (
        firstPayment &&
        order.invoices.some((invoice) =>
          invoice.payments.some((payment) => payment.status === 'SUCCEEDED'),
        )
      )
        throw invalidUpdate(
          'Đơn đã có giao dịch thành công; vui lòng kiểm tra lại',
          409,
        )
      if (
        !firstPayment &&
        ['PAID', 'PROVISIONING', 'COMPLETED', 'FAILED'].includes(
          input.status,
        ) &&
        !order.invoices.some((invoice) =>
          invoice.payments.some((payment) => payment.status === 'SUCCEEDED'),
        )
      )
        throw invalidUpdate(
          'Chưa có giao dịch thanh toán thành công cho đơn này',
          409,
        )
      // Optimistic guard also serializes concurrent confirmation requests for one order.
      const changed = await tx.order.updateMany({
        where: { id: order.id, status: input.expectedStatus },
        data: { status: input.status, paymentMethod: input.paymentMethod },
      })
      if (changed.count !== 1)
        throw invalidUpdate('Đơn hàng đã được cập nhật; vui lòng tải lại', 409)
      const now = new Date()
      if (firstPayment) {
        const paidAt = new Date(input.paidAt!)
        const openInvoice = order.invoices.find(
          (candidate) => candidate.status === 'OPEN',
        )
        const invoice = openInvoice
          ? await tx.invoice.update({
              where: { id: openInvoice.id },
              data: { status: 'PAID', paidAt, totalMinor: order.totalMinor },
            })
          : await tx.invoice.create({
              data: {
                id: createId(),
                invoiceNumber: `HF-INV-${createId().replaceAll('-', '').slice(0, 20).toUpperCase()}`,
                organizationId: order.organizationId,
                orderId: order.id,
                status: 'PAID',
                paidAt,
                totalMinor: order.totalMinor,
              },
            })
        await tx.payment.create({
          data: {
            id: createId(),
            invoiceId: invoice.id,
            provider: 'ADMIN_MANUAL',
            providerPaymentId: input.paymentReference!.trim(),
            idempotencyKey: `admin-order-paid:${order.id}`,
            status: 'SUCCEEDED',
            amountMinor: order.totalMinor,
            currency: order.currency,
            rawResponse: {
              source: 'admin_manual',
              method: input.paymentMethod,
              recordedBy: user.id,
            },
          },
        })
        if (order.couponCode) {
          await tx.coupon.updateMany({
            where: { code: order.couponCode },
            data: { usedCount: { increment: 1 } },
          })
        }
      }
      if (
        firstPayment ||
        ['PROVISIONING', 'COMPLETED', 'FAILED'].includes(input.status)
      ) {
        for (const item of order.items) {
          const active = input.status === 'COMPLETED'
          const targetServiceStatus = active
            ? 'ACTIVE'
            : input.status === 'PROVISIONING'
              ? 'PROVISIONING'
              : input.status === 'FAILED'
                ? 'ERROR'
                : 'PENDING'
          const previous = item.customerService
          const activatedAt = active ? (previous?.activatedAt ?? now) : null
          const expiresAt = active
            ? (previous?.expiresAt ??
              addBillingPeriod(activatedAt!, item.configuration))
            : null
          const service = previous
            ? previous.status !== targetServiceStatus
              ? await tx.customerService.update({
                  where: { id: previous.id },
                  data: { status: targetServiceStatus, activatedAt, expiresAt },
                })
              : previous
            : await tx.customerService.create({
                data: {
                  id: createId(),
                  orderItemId: item.id,
                  organizationId: order.organizationId,
                  productId: item.productId,
                  planId: item.planId,
                  serviceCode: `SVC-${createId().replaceAll('-', '').slice(0, 20).toUpperCase()}`,
                  status: targetServiceStatus,
                  configuration: item.configuration as Prisma.InputJsonValue,
                  activatedAt,
                  expiresAt,
                },
              })
          if (!previous || previous.status !== targetServiceStatus) {
            await tx.serviceEvent.create({
              data: {
                id: createId(),
                serviceId: service.id,
                eventType: active
                  ? 'MANUAL_ACTIVATION'
                  : firstPayment
                    ? 'ORDER_PAID'
                    : 'ORDER_STATUS_CHANGE',
                fromStatus: previous?.status ?? null,
                toStatus: service.status,
                createdById: user.id,
                payload: { orderId: order.id, source: 'admin_manual' },
              },
            })
          }
          if (active) {
            await tx.orderItem.update({
              where: { id: item.id },
              data: { periodStart: activatedAt, periodEnd: expiresAt },
            })
          }
        }
      }
      await tx.auditLog.create({
        data: {
          id: createId(),
          actorUserId: user.id,
          module: 'commerce',
          resource: 'order',
          action: 'UPDATE',
          entityType: 'commerce.order',
          entityId: order.id,
          before: { status: order.status, paymentMethod: order.paymentMethod },
          after: { status: input.status, paymentMethod: input.paymentMethod },
          metadata: {
            source: 'admin',
            paymentReference: firstPayment ? input.paymentReference : null,
            manualFulfillmentConfirmed: input.manualFulfillmentConfirmed,
          },
        },
      })
      return { id: order.id, status: input.status }
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  )
}

export async function listAdminOrders(input: ListAdminOrdersInput) {
  await requirePermission('commerce.order.view')
  const result = await findAdminOrders(input)
  return {
    items: result.items.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      currency: order.currency,
      totalMinor: Number(order.totalMinor),
      createdAt: order.createdAt.toISOString(),
      paymentMethod: order.paymentMethod,
      customer: {
        id: order.user.id,
        name: order.user.userProfile?.fullName || order.user.displayName,
        email: order.user.email,
      },
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        productName: item.product.name,
        productSlug: item.product.slug,
        categoryName: item.product.category.name,
        categorySlug: item.product.category.slug,
        providerName: item.product.providerCategory?.name ?? null,
        planName: item.plan?.name ?? null,
      })),
    })),
    meta: createPaginationMeta(result.total, input),
  }
}

export async function getAdminOrderOptions() {
  await requirePermission('commerce.order.view')
  const result = await findAdminOrderOptions()
  return {
    totalOrders: result.statusCounts.reduce(
      (sum, row) => sum + row._count._all,
      0,
    ),
    statusCounts: Object.fromEntries(
      result.statusCounts.map((row) => [row.status, row._count._all]),
    ),
    categories: result.categories,
    providers: result.providers,
  }
}

function configText(value: unknown, key: string): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const field = (value as Record<string, unknown>)[key]
  return typeof field === 'string' && field.trim() ? field.trim() : null
}

export async function getAdminOrderDetail(id: string) {
  await requirePermission('commerce.order.view')
  const order = await findAdminOrderDetail(id)
  if (!order)
    throw createAppError({
      message: 'Không tìm thấy đơn hàng',
      errorCode: 'ORDER_NOT_FOUND',
      statusCode: 404,
    })
  const datacenterIds = order.items
    .map((item) => configText(item.configuration, 'datacenterId'))
    .filter((value): value is string =>
      Boolean(value && /^[0-9a-f-]{36}$/i.test(value)),
    )
  const datacenters = datacenterIds.length
    ? await prisma.datacenter.findMany({
        where: { id: { in: datacenterIds } },
        select: { id: true, name: true, city: true, countryCode: true },
      })
    : []
  const datacenterById = new Map(datacenters.map((item) => [item.id, item]))
  const iso = (value: Date | null) => value?.toISOString() ?? null
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    couponCode: order.couponCode,
    customerNote: order.customerNote,
    subtotalMinor: Number(order.subtotalMinor),
    discountMinor: Number(order.discountMinor),
    taxMinor: Number(order.taxMinor),
    totalMinor: Number(order.totalMinor),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    customer: {
      id: order.user.id,
      name: order.user.userProfile?.fullName || order.user.displayName,
      email: order.user.email,
      phone: order.user.userProfile?.phone || order.user.phone,
      avatarUrl: order.user.userProfile?.avatarUrl ?? null,
      address: order.user.addresses[0]
        ? [
            order.user.addresses[0].addressLine,
            order.user.addresses[0].districtName,
            order.user.addresses[0].provinceName,
          ]
            .filter(Boolean)
            .join(', ')
        : null,
      orderCount: order.user._count.orders,
      registeredAt: order.user.createdAt.toISOString(),
    },
    items: order.items.map((item) => {
      const selectedDatacenter = datacenterById.get(
        configText(item.configuration, 'datacenterId') ?? '',
      )
      const assignedDatacenter = item.customerService?.resource?.datacenter
      return {
        id: item.id,
        quantity: item.quantity,
        unitAmountMinor: Number(item.unitAmountMinor),
        totalAmountMinor: Number(item.totalAmountMinor),
        periodStart: iso(item.periodStart),
        periodEnd: iso(item.periodEnd),
        productName: item.product.name,
        productDescription: item.product.description,
        categoryName: item.product.category.name,
        categorySlug: item.product.category.slug,
        providerName: item.product.providerCategory?.name ?? null,
        planName: item.plan?.name ?? null,
        hostname:
          configText(item.configuration, 'hostname') ||
          configText(item.customerService?.configuration, 'hostname'),
        operatingSystem:
          configText(item.configuration, 'operatingSystem') ||
          configText(item.customerService?.configuration, 'operatingSystem'),
        ipAddress: configText(item.customerService?.configuration, 'ipAddress'),
        datacenter: assignedDatacenter || selectedDatacenter || null,
        service: item.customerService
          ? {
              id: item.customerService.id,
              serviceCode: item.customerService.serviceCode,
              status: item.customerService.status,
              activatedAt: iso(item.customerService.activatedAt),
              expiresAt: iso(item.customerService.expiresAt),
              externalId: item.customerService.resource?.externalId ?? null,
            }
          : null,
        events:
          item.customerService?.events.map((event) => ({
            id: event.id,
            eventType: event.eventType,
            fromStatus: event.fromStatus,
            toStatus: event.toStatus,
            createdAt: event.createdAt.toISOString(),
          })) ?? [],
      }
    }),
    invoices: order.invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      totalMinor: Number(invoice.totalMinor),
      paidAt: iso(invoice.paidAt),
      createdAt: invoice.createdAt.toISOString(),
      payments: invoice.payments.map((payment) => ({
        id: payment.id,
        provider: payment.provider,
        providerPaymentId: payment.providerPaymentId,
        status: payment.status,
        amountMinor: Number(payment.amountMinor),
        currency: payment.currency,
        createdAt: payment.createdAt.toISOString(),
      })),
    })),
    provisioningJobs: order.provisioningJobs.map((job) => ({
      id: job.id,
      jobType: job.jobType,
      status: job.status,
      errorCode: job.errorCode,
      createdAt: job.createdAt.toISOString(),
      completedAt: iso(job.completedAt),
    })),
  }
}
