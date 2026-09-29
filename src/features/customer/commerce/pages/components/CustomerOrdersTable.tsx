import { Link } from '@tanstack/react-router'
import type { customerOrderService } from '../../services/customerOrderService'
import {
  orderDate,
  orderMoney,
  orderStatus,
  paymentMethodLabels,
} from '../../utils/orderDisplay'
import { useTranslation } from 'react-i18next'

type OrderRow = Awaited<
  ReturnType<typeof customerOrderService.list>
>['items'][number]

export function CustomerOrdersTable({ rows }: { rows: OrderRow[] }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? i18n.language
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[930px] border-collapse text-left text-sm">
        <thead className="bg-muted text-xs font-semibold text-foreground">
          <tr>
            <th className="px-4 py-3">{t('customerOrders.number')}</th>
            <th className="px-4 py-3">{t('customerOrders.products')}</th>
            <th className="px-4 py-3">{t('customerOrders.placedAt')}</th>
            <th className="px-4 py-3">{t('customerOrders.payment')}</th>
            <th className="px-4 py-3">{t('customerOrders.total')}</th>
            <th className="px-4 py-3">{t('customerOrders.statusLabel')}</th>
            <th className="px-4 py-3">{t('customerOrders.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((order) => {
            const status = orderStatus(order.status)
            return (
              <tr
                key={order.id}
                className="bg-card transition hover:bg-primary/5"
              >
                <td className="px-4 py-4">
                  <Link
                    to="/customer/dashboard/orders/$id"
                    params={{ id: order.id }}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t('customerOrders.itemCount', { count: order.itemCount })}
                  </p>
                </td>
                <td className="max-w-64 px-4 py-4">
                  <p
                    className="truncate font-medium"
                    title={order.items
                      .map((item) => item.productName)
                      .join(', ')}
                  >
                    {order.items[0]?.productName ?? '—'}
                    {order.items.length > 1 &&
                      ` ${t('customerOrders.morePlans', { count: order.items.length - 1 })}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.items[0]
                      ? t(`customerCategories.${order.items[0].categorySlug}`, {
                          defaultValue: order.items[0].categoryName,
                        })
                      : '—'}
                  </p>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                  {orderDate(order.createdAt, locale)}
                </td>
                <td className="px-4 py-4">
                  {order.paymentMethod
                    ? t(`customerOrders.method.${order.paymentMethod}`, {
                        defaultValue:
                          paymentMethodLabels[order.paymentMethod] ??
                          order.paymentMethod,
                      })
                    : '—'}
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-bold text-blue-600">
                  {orderMoney(order.totalMinor, order.currency, locale)}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold ${status.className}`}
                  >
                    <span className={`size-1.5 rounded-full ${status.dot}`} />
                    {t(status.labelKey, { defaultValue: status.label })}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <Link
                    to="/customer/dashboard/orders/$id"
                    params={{ id: order.id }}
                    className="rounded-lg border border-blue-200 px-3 py-2 font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    {t('customerOrders.detail')}
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
