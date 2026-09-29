import { Link } from '@tanstack/react-router'
import {
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  UserRound,
  Wallet,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AdminOrderDetail } from '../types'
import { DetailRow, StatusBadge, useOrderFormat } from './DetailShared'

export function CustomerCard({ order }: { order: AdminOrderDetail }) {
  const { t } = useTranslation('adminOrders')
  const { date } = useOrderFormat()
  const customer = order.customer
  return (
    <section className="rounded-2xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/40 p-5 shadow-sm">
      <h2 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-lg font-bold">
        <UserRound size={20} className="text-blue-600" />
        {t('detail.customerInfo')}
      </h2>
      <div className="mt-4 flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 font-semibold text-white shadow-md shadow-blue-200">
          {customer.avatarUrl ? (
            <img
              src={customer.avatarUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            customer.name.slice(0, 2).toUpperCase()
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold">{customer.name}</div>
          <div className="text-sm text-slate-500">{t('detail.customer')}</div>
        </div>
        <Link
          to="/admin/dashboard/users/$userId"
          params={{ userId: customer.id }}
          className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          {t('detail.viewProfile')}
        </Link>
      </div>
      <div className="mt-5 space-y-2 text-sm text-slate-600">
        <p className="flex items-center gap-2">
          <Mail size={16} />
          {customer.email}
        </p>
        {customer.phone && (
          <p className="flex items-center gap-2">
            <Phone size={16} />
            {customer.phone}
          </p>
        )}
        {customer.address && (
          <p className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            {customer.address}
          </p>
        )}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm">
        <div>
          <p className="text-slate-500">{t('detail.totalOrders')}</p>
          <p className="mt-1 font-bold">{customer.orderCount}</p>
        </div>
        <div>
          <p className="text-slate-500">{t('detail.registeredAt')}</p>
          <p className="mt-1 font-bold">{date(customer.registeredAt)}</p>
        </div>
      </div>
    </section>
  )
}

export function OrderInfoCard({ order }: { order: AdminOrderDetail }) {
  const { t } = useTranslation('adminOrders')
  const { date } = useOrderFormat()
  return (
    <section className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/40 p-5 shadow-sm">
      <h2 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-lg font-bold">
        <ClipboardList size={20} className="text-blue-600" />
        {t('detail.orderInfo')}
      </h2>
      <div className="mt-2 text-sm">
        <DetailRow label={t('orderNumber')} value={order.orderNumber} strong />
        <DetailRow label={t('createdAt')} value={date(order.createdAt)} />
        <DetailRow
          label={t('detail.updatedAt')}
          value={date(order.updatedAt)}
        />
        <DetailRow
          label={t('status')}
          value={<StatusBadge status={order.status} />}
        />
        <DetailRow
          label={t('detail.itemCount')}
          value={order.items.reduce((sum, item) => sum + item.quantity, 0)}
        />
        <DetailRow
          label={t('detail.customerNote')}
          value={order.customerNote || '—'}
        />
      </div>
    </section>
  )
}

export function PaymentCard({ order }: { order: AdminOrderDetail }) {
  const { t } = useTranslation('adminOrders')
  const { money, date } = useOrderFormat()
  const invoice = order.invoices[0]
  const payment = invoice?.payments[0]
  return (
    <section className="rounded-2xl border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/40 p-5 shadow-sm">
      <h2 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-lg font-bold">
        <Wallet size={20} className="text-blue-600" />
        {t('detail.payment')}
      </h2>
      <div className="mt-2 text-sm">
        <DetailRow
          label={t('detail.subtotal')}
          value={money(order.subtotalMinor, order.currency)}
        />
        <DetailRow
          label={
            order.couponCode
              ? `${t('detail.discount')} (${order.couponCode})`
              : t('detail.discount')
          }
          value={
            order.discountMinor
              ? `-${money(order.discountMinor, order.currency)}`
              : '—'
          }
        />
        <DetailRow
          label={t('detail.tax')}
          value={money(order.taxMinor, order.currency)}
        />
        <DetailRow
          label={t('detail.total')}
          value={
            <span className="text-xl text-blue-600">
              {money(order.totalMinor, order.currency)}
            </span>
          }
          strong
        />
        <DetailRow
          label={t('detail.paymentMethod')}
          value={
            order.paymentMethod
              ? t(`detail.methods.${order.paymentMethod}`, {
                  defaultValue: order.paymentMethod,
                })
              : '—'
          }
        />
        <DetailRow
          label={t('detail.invoice')}
          value={invoice?.invoiceNumber ?? '—'}
        />
        <DetailRow
          label={t('detail.invoiceStatus')}
          value={
            invoice?.status ? (
              <span className="rounded-lg bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
                {t(`detail.invoiceStatuses.${invoice.status}`, {
                  defaultValue: invoice.status,
                })}
              </span>
            ) : (
              '—'
            )
          }
        />
        {invoice?.paidAt && (
          <DetailRow label={t('detail.paidAt')} value={date(invoice.paidAt)} />
        )}
        {payment && (
          <>
            <DetailRow
              label={t('detail.transaction')}
              value={payment.providerPaymentId ?? '—'}
            />
            <DetailRow
              label={t('status')}
              value={
                <span className="rounded-lg bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
                  {t(`detail.paymentStatuses.${payment.status}`, {
                    defaultValue: payment.status,
                  })}
                </span>
              }
            />
          </>
        )}
      </div>
      {order.status === 'PENDING_PAYMENT' && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          {t('detail.pendingPaymentNote')}
        </p>
      )}
    </section>
  )
}
