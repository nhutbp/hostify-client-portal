import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Pencil,
  ServerCog,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useProxyPackage } from '../../hooks/useProxyPackages'
import type { ProxyPackageDetail } from '../../services/proxyService'
import { proxyFeatureKeys } from './components/proxyFormTypes'

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium text-[#11184c]">{value || '—'}</dd>
    </div>
  )
}

function Details({ product }: { product: ProxyPackageDetail }) {
  const { t, i18n } = useTranslation('catalog')
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  const money = (value: number) =>
    new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value)
  const f = product.features
  const resources = [
    [t('proxy.new.proxyType'), t(`proxy.types.${f.proxyType}`)],
    [t('proxy.new.displayCategory'), f.displayCategory],
    [t('proxy.new.country'), t(`proxy.countries.${f.country}`)],
    [t('proxy.new.ipMode'), t(`proxy.modes.${f.ipMode}`)],
    [t('proxy.new.protocols'), f.protocols.join(', ')],
    [t('proxy.new.ipDelivery'), t(`proxy.delivery.${f.ipDelivery}`)],
    [
      t('proxy.new.bandwidthGb'),
      f.bandwidthGb === -1 ? t('proxy.unlimited') : `${f.bandwidthGb} GB`,
    ],
    [t('proxy.new.concurrentConnections'), String(f.concurrentConnections)],
  ]
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
          to="/admin/dashboard/catalog/proxy"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
        >
          <ArrowLeft className="size-4" />
          {t('proxy.detail.back')}
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-[#11184c]">
            {product.name}
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${product.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : product.status === 'DRAFT' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}
          >
            {t(
              product.status === 'ACTIVE'
                ? 'proxy.active'
                : product.status === 'DRAFT'
                  ? 'proxy.draft'
                  : 'proxy.archived',
            )}
          </span>
          <Link
            to="/admin/dashboard/catalog/proxy/$id/edit"
            params={{ id: product.id }}
            className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"
          >
            <Pencil className="size-4" />
            {t('proxy.edit.title')}
          </Link>
        </div>
        <p className="mt-1 text-base text-slate-500">{product.description}</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-5">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#11184c]">
              <ServerCog className="size-5 text-blue-600" />
              {t('proxy.new.configuration')}
            </h2>
            <dl className="mt-3 grid gap-x-6 sm:grid-cols-2">
              {resources.map(([label, value]) => (
                <DetailItem key={label} label={label} value={value} />
              ))}
            </dl>
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-xl font-bold text-[#11184c]">
              {t('proxy.new.features')}
            </h2>
            <dl className="mt-3 grid gap-x-6 sm:grid-cols-2">
              {proxyFeatureKeys.map((key) => (
                <DetailItem
                  key={key}
                  label={t(`proxy.features.${key}`)}
                  value={f[key] ? t('proxy.detail.yes') : t('proxy.detail.no')}
                />
              ))}
            </dl>
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#11184c]">
              <CalendarDays className="size-5 text-blue-600" />
              {t('proxy.new.pricing')}
            </h2>
            {product.prices.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[400px] text-left text-sm">
                  <thead className="border-b bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-3">{t('proxy.new.cycle')}</th>
                      <th className="px-3 py-3">
                        {t('proxy.new.afterDiscount')}
                      </th>
                      <th className="px-3 py-3">
                        {t('proxy.detail.effectiveFrom')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {product.prices.map((price) => (
                      <tr key={price.id}>
                        <td className="px-3 py-3">
                          {t(
                            `proxy.new.${cycleKeys[price.billingCycle] ?? 'monthly'}`,
                          )}
                        </td>
                        <td className="px-3 py-3 font-semibold text-blue-600">
                          {money(price.amountMinor)}
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
                {t('proxy.detail.noPrices')}
              </p>
            )}
          </section>
          {product.content && (
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-xl font-bold text-[#11184c]">
                {t('proxy.new.content')}
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
        <section className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="flex items-center gap-2 text-xl font-bold text-[#11184c]">
            <Building2 className="size-5 text-blue-600" />
            {t('proxy.detail.information')}
          </h2>
          <dl className="mt-3">
            <DetailItem label={t('proxy.detail.code')} value={product.code} />
            <DetailItem label={t('proxy.new.slug')} value={product.slug} />
            <DetailItem
              label={t('proxy.provider')}
              value={product.providerCategory?.name}
            />
            <DetailItem
              label={t('proxy.detail.createdAt')}
              value={formatDate(product.createdAt)}
            />
            <DetailItem
              label={t('proxy.detail.updatedAt')}
              value={formatDate(product.updatedAt)}
            />
          </dl>
        </section>
      </div>
    </div>
  )
}

export default function ProxyPackageDetailPage({ id }: { id: string }) {
  const { t } = useTranslation('catalog')
  const query = useProxyPackage(id)
  if (query.isPending)
    return (
      <p className="py-12 text-center text-slate-500">
        {t('proxy.detail.loading')}
      </p>
    )
  if (query.isError)
    return (
      <div role="alert" className="rounded-xl bg-white p-6 text-red-600">
        <p>{t('proxy.detail.loadFailed')}</p>
        <Link
          to="/admin/dashboard/catalog/proxy"
          className="mt-3 inline-block text-blue-600"
        >
          {t('proxy.detail.back')}
        </Link>
      </div>
    )
  return <Details product={query.data} />
}
