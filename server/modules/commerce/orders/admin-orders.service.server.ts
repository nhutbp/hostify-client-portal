import { requirePermission } from '../../../common/auth-context.server'
import { createPaginationMeta } from '../../../common/pagination.server'
import { findAdminOrders } from './admin-orders.repository.server'
import type { ListAdminOrdersInput } from './admin-orders.schemas'

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
