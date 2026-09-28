import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Building2,
  Pencil,
  ServerCog,
  Tag,
  Settings2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useViaPackage } from '../../hooks/useViaPackages'
import type { ViaPackageDetail } from '../../services/viaService'
import { viaExtraKeys } from './components/viaFormTypes'

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium text-[#11184c]">{value || '—'}</dd>
    </div>
  )
}

function Details({ product }: { product: ViaPackageDetail }) {
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
  const specs = [
    ['platform', f.platform],
    ['country', f.country],
    ['accountType', f.accountType],
    ['accountAge', f.accountAge],
    ['verification', f.verification],
    ['twoFactor', String(f.twoFactor)],
    ['changeLimit', f.changeLimit],
    ['deliveryMethod', f.deliveryMethod],
    ['warrantyDays', String(f.warrantyDays)],
  ]
  const tiers = product.quantityPrices.flatMap((tier) =>
    tier &&
    typeof tier === 'object' &&
    !Array.isArray(tier) &&
    typeof tier.quantity === 'number' &&
    typeof tier.amount === 'number'
      ? [
          {
            quantity: tier.quantity,
            amount: tier.amount,
            discountPercent:
              typeof tier.discountPercent === 'number'
                ? tier.discountPercent
                : 0,
          },
        ]
      : [],
  )
  return (
    <div className="space-y-5 pb-8 text-slate-900">
      <div>
        <Link
          to="/admin/dashboard/catalog/via"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
        >
          <ArrowLeft className="size-4" />
          {t('via.detail.back')}
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
                ? 'via.active'
                : product.status === 'DRAFT'
                  ? 'via.draft'
                  : 'via.archived',
            )}
          </span>
          <Link
            to="/admin/dashboard/catalog/via/$id/edit"
            params={{ id: product.id }}
            className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"
          >
            <Pencil className="size-4" />
            {t('via.edit.title')}
          </Link>
        </div>
        <p className="mt-1 text-base text-slate-500">{product.description}</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-5">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#11184c]">
              <ServerCog className="size-5 text-blue-600" />
              {t('via.new.configuration')}
            </h2>
            <dl className="mt-3 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
              {specs.map(([key, value]) => (
                <DetailItem
                  key={key}
                  label={t(`via.new.${key}`)}
                  value={t(`via.options.${key}.${value}`)}
                />
              ))}
            </dl>
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#11184c]">
              <Settings2 className="size-5 text-blue-600" />
              {t('via.new.extras')}
            </h2>
            <dl className="mt-3 grid gap-x-6 sm:grid-cols-2">
              {viaExtraKeys.map((key) => (
                <DetailItem
                  key={key}
                  label={t(`via.extras.${key}`)}
                  value={f[key] ? t('via.detail.yes') : t('via.detail.no')}
                />
              ))}
            </dl>
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#11184c]">
              <Tag className="size-5 text-blue-600" />
              {t('via.new.pricing')}
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[400px] text-left text-sm">
                <thead className="border-b bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-3">{t('via.new.quantity')}</th>
                    <th className="px-3 py-3">{t('via.new.amount')}</th>
                    <th className="px-3 py-3">{t('via.new.discount')}</th>
                    <th className="px-3 py-3">{t('via.new.afterDiscount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tiers.map((tier) => (
                    <tr key={tier.quantity}>
                      <td className="px-3 py-3">{tier.quantity}</td>
                      <td className="px-3 py-3">{money(tier.amount)}</td>
                      <td className="px-3 py-3">{tier.discountPercent}%</td>
                      <td className="px-3 py-3 font-semibold text-blue-600">
                        {money(
                          Math.round(
                            tier.amount * (1 - tier.discountPercent / 100),
                          ),
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          {product.content && (
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-xl font-bold text-[#11184c]">
                {t('via.new.content')}
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
            {t('via.detail.information')}
          </h2>
          <dl className="mt-3">
            <DetailItem label={t('via.detail.code')} value={product.code} />
            <DetailItem label={t('via.new.slug')} value={product.slug} />
            <DetailItem
              label={t('via.provider')}
              value={product.providerCategory?.name}
            />
            <DetailItem
              label={t('via.detail.createdAt')}
              value={formatDate(product.createdAt)}
            />
            <DetailItem
              label={t('via.detail.updatedAt')}
              value={formatDate(product.updatedAt)}
            />
          </dl>
        </section>
      </div>
    </div>
  )
}
export default function ViaPackageDetailPage({ id }: { id: string }) {
  const { t } = useTranslation('catalog')
  const query = useViaPackage(id)
  if (query.isPending)
    return (
      <p className="py-12 text-center text-slate-500">
        {t('via.detail.loading')}
      </p>
    )
  if (query.isError)
    return (
      <div role="alert" className="rounded-xl bg-white p-6 text-red-600">
        <p>{t('via.detail.loadFailed')}</p>
        <Link
          to="/admin/dashboard/catalog/via"
          className="mt-3 inline-block text-blue-600"
        >
          {t('via.detail.back')}
        </Link>
      </div>
    )
  return <Details product={query.data} />
}
