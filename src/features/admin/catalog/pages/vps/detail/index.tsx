import { ArrowLeft, Cpu, HardDrive, MapPin, Pencil, Server } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useVpsPackage } from '../../../hooks/useVpsPackage'
import type { VpsPackageDetail } from '../../../services/vpsService'

function DetailItem({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium text-[#11184c]">{value || '—'}</dd>
    </div>
  )
}

function PackageDetails({ product }: { product: VpsPackageDetail }) {
  const { t, i18n } = useTranslation('catalog')
  const plan = product.plans[0]
  const features =
    plan?.features &&
    typeof plan.features === 'object' &&
    !Array.isArray(plan.features)
      ? (plan.features as Record<string, unknown>)
      : {}
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  const formatPrice = (value: number, currency: string) =>
    new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  const cycles: Record<string, string> = {
    MONTHLY: t('vps.form.cycleMonth'),
    QUARTERLY: t('vps.form.cycleQuarter'),
    SEMI_ANNUAL: t('vps.form.cycleHalfYear'),
    YEARLY: t('vps.form.cycleYear'),
  }

  return (
    <div className="space-y-5 pb-8 text-slate-900">
      <div>
        <Link
          to="/dashboard/catalog/vps"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
        >
          <ArrowLeft className="size-4" /> {t('vps.detail.back')}
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-[#11184c]">
            {product.name}
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${product.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
          >
            {product.status === 'ACTIVE'
              ? t('vps.form.visible')
              : t('vps.form.draft')}
          </span>
          <Link
            to="/dashboard/catalog/vps/$id/edit"
            params={{ id: product.id }}
            className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Pencil className="size-4" /> {t('vps.form.editTitle')}
          </Link>
        </div>
        <p className="mt-1 text-base text-slate-500">{product.description}</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-5">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#11184c]">
              <Cpu className="size-5 text-blue-600" />
              {t('vps.detail.configuration')}
            </h2>
            <dl className="mt-3 grid gap-x-6 sm:grid-cols-2">
              <DetailItem
                label={t('vps.form.cpu')}
                value={features.cpu == null ? '—' : `${features.cpu} vCPU`}
              />
              <DetailItem
                label={t('vps.form.ram')}
                value={features.ramGb == null ? '—' : `${features.ramGb} GB`}
              />
              <DetailItem
                label={t('vps.form.disk')}
                value={
                  features.diskGb == null
                    ? '—'
                    : `${features.diskGb} GB ${features.diskType ?? ''}`
                }
              />
              <DetailItem
                label={t('vps.form.bandwidth')}
                value={String(features.bandwidth ?? '—')}
              />
              <DetailItem
                label={t('vps.form.ipCount')}
                value={String(features.ipCount ?? '—')}
              />
              <DetailItem
                label={t('vps.form.defaultOs')}
                value={product.operatingSystem ?? '—'}
              />
            </dl>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#11184c]">
              <HardDrive className="size-5 text-blue-600" />
              {t('vps.detail.pricing')}
            </h2>
            {plan?.prices.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[400px] text-left text-sm">
                  <thead className="border-b bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-3">{t('vps.form.period')}</th>
                      <th className="px-3 py-3">{t('vps.form.amount')}</th>
                      <th className="px-3 py-3">
                        {t('vps.detail.effectiveFrom')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {plan.prices.map((price) => (
                      <tr key={price.id}>
                        <td className="px-3 py-3">
                          {cycles[price.billingCycle] ?? price.billingCycle}
                        </td>
                        <td className="px-3 py-3 font-semibold text-blue-600">
                          {formatPrice(price.amountMinor, price.currency)}
                        </td>
                        <td className="px-3 py-3 text-slate-500">
                          {formatDate(price.effectiveFrom)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-slate-500">{t('vps.detail.noPrices')}</p>
            )}
          </section>

          {product.content && (
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-xl font-bold text-[#11184c]">
                {t('vps.form.content')}
              </h2>
              <p className="mt-4 whitespace-pre-wrap break-words text-slate-700">
                {product.content
                  .replace(/<[^>]*>/g, ' ')
                  .replace(/&nbsp;/g, ' ')
                  .replace(/&amp;/g, '&')
                  .replace(/\s+/g, ' ')
                  .trim()}
              </p>
            </section>
          )}
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#11184c]">
              <Server className="size-5 text-blue-600" />
              {t('vps.detail.information')}
            </h2>
            <dl className="mt-3">
              <DetailItem label={t('vps.detail.code')} value={product.code} />
              <DetailItem
                label={t('vps.form.category')}
                value={product.category.name}
              />
              <DetailItem
                label={t('vps.table.provider')}
                value={product.providerCategory?.name ?? '—'}
              />
              <DetailItem
                label={t('vps.detail.featured')}
                value={
                  product.featured ? t('vps.detail.yes') : t('vps.detail.no')
                }
              />
              <DetailItem
                label={t('vps.form.tag')}
                value={product.tags.join(', ')}
              />
              <DetailItem
                label={t('vps.form.displayOrder')}
                value={String(product.displayOrder)}
              />
              <DetailItem
                label={t('vps.detail.createdAt')}
                value={formatDate(product.createdAt)}
              />
              <DetailItem
                label={t('vps.detail.updatedAt')}
                value={formatDate(product.updatedAt)}
              />
            </dl>
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#11184c]">
              <MapPin className="size-5 text-blue-600" />
              {t('vps.form.datacenters')}
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {product.datacenters.map((datacenter) => (
                <li
                  key={datacenter.id}
                  className="rounded-lg bg-slate-50 px-3 py-2"
                >
                  {datacenter.name}
                  {datacenter.city ? ` · ${datacenter.city}` : ''} ·{' '}
                  {datacenter.countryCode}
                </li>
              ))}
            </ul>
            {!product.datacenters.length && (
              <p className="mt-3 text-sm text-slate-500">
                {t('vps.detail.noDatacenters')}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default function VpsPackageDetailPage({ id }: { id: string }) {
  const { t } = useTranslation('catalog')
  const query = useVpsPackage(id)
  if (query.isPending)
    return (
      <p className="py-12 text-center text-slate-500">
        {t('vps.detail.loading')}
      </p>
    )
  if (query.isError)
    return (
      <div role="alert" className="rounded-xl bg-white p-6 text-red-600">
        <p>{t('vps.detail.loadFailed')}</p>
        <Link
          to="/dashboard/catalog/vps"
          className="mt-3 inline-block text-blue-600 hover:underline"
        >
          {t('vps.detail.back')}
        </Link>
      </div>
    )
  return <PackageDetails product={query.data} />
}
