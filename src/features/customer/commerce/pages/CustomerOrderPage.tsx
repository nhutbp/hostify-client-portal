import { Link, useParams } from '@tanstack/react-router'
import { useCustomerOrder } from '../hooks/useCustomerOrder'
import {
  orderDate,
  orderMoney,
  orderStatus,
  paymentMethodLabels,
} from '../utils/orderDisplay'
import { useTranslation } from 'react-i18next'

export default function CustomerOrderPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? i18n.language
  const { id } = useParams({
    from: '/_dashboard/customer/dashboard/orders/$id',
  })
  const order = useCustomerOrder(id)
  if (order.isPending)
    return (
      <div className="rounded-xl bg-card p-10">
        {t('customerOrders.loading')}
      </div>
    )
  if (!order.data)
    return (
      <div className="rounded-xl bg-card p-10 text-red-600 dark:text-red-300">
        {t('customerOrders.loadError')}
      </div>
    )
  const data = order.data
  const status = orderStatus(data.status)
  return (
    <div className="mx-auto max-w-4xl space-y-5 text-foreground">
      <div>
        <Link to="/customer/dashboard/orders" className="text-sm text-blue-600">
          ← {t('customerOrders.title')}
        </Link>
        <h1 className="mt-2 text-3xl font-bold">
          {t('customerOrders.detailTitle')}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t('customerOrders.detailDescription')}
        </p>
      </div>
      <div className="rounded-xl bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">
              {t('customerOrders.number')}
            </p>
            <strong className="text-xl">{data.orderNumber}</strong>
          </div>
          <span
            className={`h-fit rounded-full px-4 py-2 font-semibold ${status.className}`}
          >
            {t(status.labelKey, { defaultValue: status.label })}
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {t('customerOrders.placedAndMethod', {
            date: orderDate(data.createdAt, locale),
            method: data.paymentMethod
              ? t(`customerOrders.method.${data.paymentMethod}`, {
                  defaultValue:
                    paymentMethodLabels[data.paymentMethod] ??
                    data.paymentMethod,
                })
              : '—',
          })}
        </p>
        <div className="mt-5 space-y-3 border-t pt-4">
          {data.items.map((item) => (
            <div className="flex justify-between gap-3" key={item.id}>
              <span>
                {item.productName} × {item.quantity}
              </span>
              <strong>
                {orderMoney(item.totalMinor, data.currency, locale)}
              </strong>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2 border-t pt-4">
          <div className="flex justify-between">
            <span>{t('customerOrders.subtotal')}</span>
            <span>{orderMoney(data.subtotalMinor, data.currency, locale)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('customerOrders.discount')}</span>
            <span>
              -{orderMoney(data.discountMinor, data.currency, locale)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t('customerOrders.tax')}</span>
            <span>{orderMoney(data.taxMinor, data.currency, locale)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span>{t('customerOrders.grandTotal')}</span>
            <span className="text-blue-600">
              {orderMoney(data.totalMinor, data.currency, locale)}
            </span>
          </div>
        </div>
        {data.status === 'PENDING_PAYMENT' && (
          <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {t('customerOrders.pendingPaymentHint')}
          </p>
        )}
      </div>
      <Link
        to="/customer/dashboard/buy"
        className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
      >
        {t('customerOrders.continueShopping')}
      </Link>
    </div>
  )
}
