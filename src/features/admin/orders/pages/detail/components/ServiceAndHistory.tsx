import { Clock3, Globe2, Server, Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AdminOrderDetail, AdminOrderItem } from '../types'
import { DetailRow, StatusBadge, useOrderFormat } from './DetailShared'

function ServiceItem({
  item,
  currency,
}: {
  item: AdminOrderItem
  currency: string
}) {
  const { t } = useTranslation('adminOrders')
  const { date, money } = useOrderFormat()
  const datacenter = item.datacenter
  return (
    <article className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50/60 px-4 py-4">
        <span className="flex size-11 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Server size={23} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[#11184c]">
            {item.productName}{' '}
            <span className="ml-1 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
              {item.categoryName}
            </span>
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {item.productDescription || item.planName || '—'}
          </p>
        </div>
        <strong className="text-blue-600">
          {money(item.totalAmountMinor, currency)}
        </strong>
      </div>
      <div className="grid gap-x-6 px-4 py-2 text-sm sm:grid-cols-2">
        <DetailRow label={t('detail.quantity')} value={item.quantity} />
        <DetailRow label={t('detail.plan')} value={item.planName ?? '—'} />
        <DetailRow
          label={t('detail.serviceCode')}
          value={item.service?.serviceCode ?? '—'}
        />
        <DetailRow
          label={t('status')}
          value={
            item.service ? (
              <StatusBadge status={item.service.status} />
            ) : (
              t('detail.notProvisioned')
            )
          }
        />
        <DetailRow label={t('detail.hostname')} value={item.hostname ?? '—'} />
        <DetailRow
          label={t('detail.ipAddress')}
          value={item.ipAddress ?? '—'}
        />
        <DetailRow
          label={t('detail.operatingSystem')}
          value={item.operatingSystem ?? '—'}
        />
        <DetailRow label={t('provider')} value={item.providerName ?? '—'} />
        <DetailRow
          label={t('detail.datacenter')}
          value={
            datacenter
              ? [datacenter.name, datacenter.city, datacenter.countryCode]
                  .filter(Boolean)
                  .join(', ')
              : '—'
          }
        />
        <DetailRow
          label={t('detail.expiresAt')}
          value={date(item.service?.expiresAt ?? item.periodEnd)}
        />
      </div>
    </article>
  )
}

export function ServiceCard({ order }: { order: AdminOrderDetail }) {
  const { t } = useTranslation('adminOrders')
  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
        <Server size={20} className="text-blue-600" />
        {t('detail.services')}
      </h2>
      <div className="space-y-4">
        {order.items.map((item) => (
          <ServiceItem key={item.id} item={item} currency={order.currency} />
        ))}
      </div>
    </section>
  )
}

type TimelineItem = {
  id: string
  at: string
  title: string
  detail?: string
  kind: 'order' | 'payment' | 'job' | 'service'
}

export function HistoryCard({ order }: { order: AdminOrderDetail }) {
  const { t } = useTranslation('adminOrders')
  const { date } = useOrderFormat()
  const timeline: TimelineItem[] = [
    {
      id: order.id,
      at: order.createdAt,
      title: t('detail.orderCreated'),
      kind: 'order' as const,
    },
    ...order.invoices.flatMap((invoice) =>
      invoice.payments.map((payment) => ({
        id: payment.id,
        at: payment.createdAt,
        title: t('detail.paymentEvent'),
        detail: `${payment.provider} · ${payment.status}`,
        kind: 'payment' as const,
      })),
    ),
    ...order.provisioningJobs.map((job) => ({
      id: job.id,
      at: job.createdAt,
      title: t('detail.provisioningEvent'),
      detail: `${job.jobType} · ${job.status}${job.errorCode ? ` · ${job.errorCode}` : ''}`,
      kind: 'job' as const,
    })),
    ...order.items.flatMap((item) =>
      item.events.map((event) => ({
        id: event.id,
        at: event.createdAt,
        title: t('detail.serviceEvent'),
        detail: `${item.productName} · ${event.eventType}${event.toStatus ? ` → ${event.toStatus}` : ''}`,
        kind: 'service' as const,
      })),
    ),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  return (
    <section className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
        <Clock3 size={20} className="text-blue-600" />
        {t('detail.history')}
      </h2>
      <ol className="space-y-0">
        {timeline.map((entry) => (
          <li
            key={entry.id}
            className="relative flex gap-3 border-l border-blue-100 pb-5 pl-5 last:pb-0"
          >
            <span
              className={`absolute -left-1 top-1 size-2 rounded-full ${entry.kind === 'order' ? 'bg-emerald-500' : 'bg-blue-600'}`}
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{entry.title}</p>
              {entry.detail && (
                <p className="text-sm text-slate-600">{entry.detail}</p>
              )}
            </div>
            <time className="shrink-0 text-xs text-slate-500">
              {date(entry.at)}
            </time>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function QuickActionsCard({ order }: { order: AdminOrderDetail }) {
  const { t } = useTranslation('adminOrders')
  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-lg font-bold">
        <Settings2 size={20} className="text-blue-600" />
        {t('detail.quickActions')}
      </h2>
      <a
        href={`mailto:${order.customer.email}?subject=${encodeURIComponent(`${t('detail.orderSubject')} ${order.orderNumber}`)}`}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
      >
        <Globe2 size={16} />
        {t('detail.contactCustomer')}
      </a>
      <p className="mt-3 text-sm text-slate-500">
        {t('detail.actionsUnavailable')}
      </p>
    </section>
  )
}
