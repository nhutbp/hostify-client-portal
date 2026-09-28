import type { ReactNode } from 'react'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Pencil,
  Server,
  Tag,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useHostingPackage } from '../../../hooks/useHostingPackages'
import type { HostingPackageDetail } from '../../../services/hostingService'

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium text-[#11184c]">{value ?? '—'}</dd>
    </div>
  )
}

function PackageDetails({ product }: { product: HostingPackageDetail }) {
  const { t, i18n } = useTranslation('catalog')
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
  const count = (value: number) =>
    value === -1 ? t('hosting.detail.unlimited') : String(value)
  const resources = [
    [t('hosting.new.storage'), `${product.features.storageGb} GB`],
    [
      t('hosting.new.bandwidth'),
      product.features.bandwidthGb === -1
        ? t('hosting.detail.unlimited')
        : `${product.features.bandwidthGb} GB`,
    ],
    [t('hosting.new.websites'), count(product.features.websites)],
    [t('hosting.new.databases'), count(product.features.databases)],
    [t('hosting.new.cpu'), String(product.features.cpuCores)],
    [t('hosting.new.ram'), `${product.features.ramGb} GB`],
    [t('hosting.new.email'), count(product.features.emailAccounts)],
    [t('hosting.new.addonDomains'), count(product.features.addonDomains)],
  ]
  const featureFlags = [
    ['controlPanel', 'controlPanel'],
    ['freeSsl', 'freeSsl'],
    ['automaticBackups', 'automaticBackups'],
    ['malwareProtection', 'malwareProtection'],
    ['freeDomain', 'freeDomain'],
    ['multiplePhpVersions', 'multiplePhpVersions'],
    ['cronJobs', 'cronJobs'],
    ['staging', 'staging'],
  ] as const
  const cycleKeys: Record<string, string> = {
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    SEMI_ANNUAL: 'semiAnnual',
    YEARLY: 'yearly',
  }

  return (
    <div className="space-y-5 pb-8 text-slate-900">
      <div>
        <Link
          to="/dashboard/catalog/hosting"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
        >
          <ArrowLeft className="size-4" /> {t('hosting.detail.back')}
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-[#11184c]">
            {product.name}
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${product.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
          >
            {product.status === 'ACTIVE'
              ? t('hosting.active')
              : product.status === 'DRAFT'
                ? t('hosting.draft')
                : t('hosting.archived')}
          </span>
          <Link
            to="/dashboard/catalog/hosting/$id/edit"
            params={{ id: product.id }}
            className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Pencil className="size-4" /> {t('hosting.edit.title')}
          </Link>
        </div>
        <p className="mt-1 text-base text-slate-500">{product.description}</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-5">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#11184c]">
              <Server className="size-5 text-blue-600" />
              {t('hosting.new.resources')}
            </h2>
            <dl className="mt-3 grid gap-x-6 sm:grid-cols-2">
              {resources.map(([label, value]) => (
                <DetailItem key={label} label={label} value={value} />
              ))}
            </dl>
            <h3 className="mt-5 text-sm font-semibold text-[#11184c]">
              {t('hosting.new.additionalFeatures')}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {featureFlags.map(([field, key]) => (
                <span
                  key={field}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${product.features[field] ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'}`}
                >
                  {t(`hosting.new.${key}`)}:{' '}
                  {product.features[field]
                    ? t('hosting.detail.yes')
                    : t('hosting.detail.no')}
                </span>
              ))}
            </div>
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#11184c]">
              <CalendarDays className="size-5 text-blue-600" />
              {t('hosting.new.pricing')}
            </h2>
            {product.prices.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[400px] text-left text-sm">
                  <thead className="border-b bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-3">{t('hosting.new.cycle')}</th>
                      <th className="px-3 py-3">
                        {t('hosting.new.afterDiscount')}
                      </th>
                      <th className="px-3 py-3">
                        {t('hosting.detail.effectiveFrom')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {product.prices.map((price) => (
                      <tr key={price.id}>
                        <td className="px-3 py-3">
                          {t(
                            `hosting.new.${cycleKeys[price.billingCycle] ?? 'monthly'}`,
                          )}
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
              <p className="mt-4 text-slate-500">
                {t('hosting.detail.noPrices')}
              </p>
            )}
          </section>
          {product.content && (
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-xl font-bold text-[#11184c]">
                {t('hosting.new.content')}
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
              <Building2 className="size-5 text-blue-600" />
              {t('hosting.detail.information')}
            </h2>
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="mt-4 h-40 w-full rounded-lg object-cover"
              />
            )}
            <dl className="mt-3">
              <DetailItem
                label={t('hosting.detail.code')}
                value={product.code}
              />
              <DetailItem label={t('hosting.new.slug')} value={product.slug} />
              <DetailItem
                label={t('hosting.provider')}
                value={product.providerCategory?.name ?? '—'}
              />
              <DetailItem
                label={t('hosting.new.featured')}
                value={
                  product.featured
                    ? t('hosting.detail.yes')
                    : t('hosting.detail.no')
                }
              />
              <DetailItem
                label={t('hosting.new.displayOrder')}
                value={String(product.displayOrder)}
              />
              <DetailItem
                label={t('hosting.detail.createdAt')}
                value={formatDate(product.createdAt)}
              />
              <DetailItem
                label={t('hosting.detail.updatedAt')}
                value={formatDate(product.updatedAt)}
              />
            </dl>
          </section>
          {product.tags.length > 0 && (
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h2 className="flex items-center gap-2 text-xl font-bold text-[#11184c]">
                <Tag className="size-5 text-blue-600" />
                {t('hosting.new.tags')}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HostingPackageDetailPage({ id }: { id: string }) {
  const { t } = useTranslation('catalog')
  const query = useHostingPackage(id)
  if (query.isPending)
    return (
      <p className="py-12 text-center text-slate-500">
        {t('hosting.detail.loading')}
      </p>
    )
  if (query.isError)
    return (
      <div role="alert" className="rounded-xl bg-white p-6 text-red-600">
        <p>{t('hosting.detail.loadFailed')}</p>
        <Link
          to="/dashboard/catalog/hosting"
          className="mt-3 inline-block text-blue-600 hover:underline"
        >
          {t('hosting.detail.back')}
        </Link>
      </div>
    )
  return <PackageDetails product={query.data} />
}
