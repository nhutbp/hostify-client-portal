import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, CalendarDays, Server } from 'lucide-react'
import { useCustomerService } from '../hooks/useCustomerServices'
import {
  formatServiceDate,
  formatServicePrice,
  serviceStatusPresentation,
} from '../utils/serviceDisplay'
import { useTranslation } from 'react-i18next'

export default function CustomerServiceDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? i18n.language
  const { id } = useParams({
    from: '/_dashboard/customer/dashboard/services/$id',
  })
  const service = useCustomerService(id)
  if (service.isPending)
    return (
      <div className="rounded-xl bg-card p-10 text-muted-foreground">
        {t('customerServices.loading')}
      </div>
    )
  if (!service.data)
    return (
      <div className="rounded-xl bg-card p-10 text-red-600 dark:text-red-300">
        {t('customerServices.detailMissing')}
      </div>
    )
  const data = service.data
  const status = serviceStatusPresentation(data.status, data.daysRemaining)
  return (
    <div className="mx-auto max-w-5xl space-y-5 text-foreground">
      <div>
        <Link
          to="/customer/dashboard/services"
          className="inline-flex items-center gap-2 text-sm text-blue-600"
        >
          <ArrowLeft size={16} /> {t('customerServices.title')}
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">{data.productName}</h1>
            <p className="text-muted-foreground">
              {data.serviceCode} ·{' '}
              {t(`customerCategories.${data.category.slug}`, {
                defaultValue: data.category.name,
              })}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${status.className}`}
          >
            <span className={`size-2 rounded-full ${status.dot}`} />
            {t(status.labelKey, { defaultValue: status.label })}
          </span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Server className="text-blue-600 dark:text-blue-300" size={20} />{' '}
            {t('customerServices.serviceInformation')}
          </h2>
          <dl className="space-y-3 text-sm">
            {[
              [t('customerServices.plan'), data.planName ?? '—'],
              [t('customerServices.address'), data.address ?? '—'],
              [t('customerServices.provider'), data.provider ?? '—'],
              [
                t('customerServices.operatingSystem'),
                data.operatingSystem ?? '—',
              ],
              ['Datacenter', data.datacenter ?? '—'],
              ...data.details.map((value, index) => [
                t('customerServices.configuration', { index: index + 1 }),
                value,
              ]),
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 border-b border-border pb-2"
              >
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <CalendarDays
              className="text-blue-600 dark:text-blue-300"
              size={20}
            />{' '}
            {t('customerServices.billingAndDeadline')}
          </h2>
          <dl className="space-y-3 text-sm">
            {[
              [
                t('customerServices.purchasePrice'),
                formatServicePrice(
                  data.amountMinor,
                  data.currency,
                  data.billingCycle,
                  locale,
                ),
              ],
              [
                t('customerServices.activatedAt'),
                formatServiceDate(data.activatedAt, locale),
              ],
              [
                t('customerServices.expiresAt'),
                formatServiceDate(data.expiresAt, locale),
              ],
              [
                t('customerServices.timeRemaining'),
                data.daysRemaining === null
                  ? '—'
                  : data.daysRemaining > 0
                    ? t('customerServices.dayCount', {
                        count: data.daysRemaining,
                      })
                    : t('customerServices.due'),
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 border-b border-border pb-2"
              >
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
            {t('customerServices.actionsLater')}
          </p>
        </section>
      </div>
      {data.events.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
          <h2 className="mb-3 text-lg font-bold">
            {t('customerServices.history')}
          </h2>
          <div className="divide-y divide-border">
            {data.events.map((event) => (
              <div
                key={event.id}
                className="flex justify-between gap-3 py-3 text-sm"
              >
                <span>
                  {t(`customerServices.events.${event.eventType}`, {
                    defaultValue: event.eventType,
                  })}
                  {event.toStatus
                    ? ` → ${t(`customerServices.status.${event.toStatus}`, { defaultValue: event.toStatus })}`
                    : ''}
                </span>
                <time className="text-muted-foreground">
                  {formatServiceDate(event.createdAt, locale)}
                </time>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
