import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import type { HostingPackageList } from '../../services/hostingService'

type Props = {
  data: HostingPackageList
  onPageChange: (page: number) => void
}

export function HostingPlansTable({ data, onPageChange }: Props) {
  const { t, i18n } = useTranslation('catalog')
  const { items, meta } = data
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1
  const to = Math.min(meta.page * meta.limit, meta.total)
  const formatPrice = (amount: number, currency: string) =>
    new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(
      new Date(value),
    )
  const cycleLabel: Record<string, string> = {
    MONTHLY: t('hosting.monthly'),
    QUARTERLY: t('hosting.quarterly'),
    SEMI_ANNUAL: t('hosting.semiAnnual'),
    YEARLY: t('hosting.yearly'),
  }
  const statusLabel: Record<string, string> = {
    ACTIVE: t('hosting.active'),
    DRAFT: t('hosting.draft'),
    ARCHIVED: t('hosting.archived'),
  }
  return (
    <>
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-3 py-3">#</th>
              <th className="px-3 py-3">{t('hosting.name')}</th>
              <th className="px-3 py-3">{t('hosting.plan')}</th>
              <th className="px-3 py-3">{t('hosting.price')}</th>
              <th className="px-3 py-3">{t('hosting.provider')}</th>
              <th className="px-3 py-3">{t('hosting.status')}</th>
              <th className="px-3 py-3">{t('hosting.createdAt')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <tr key={item.id} className="hover:bg-blue-50/40">
                <td className="px-3 py-3 text-slate-500">{from + index}</td>
                <td className="px-3 py-3">
                  <Link
                    to="/admin/dashboard/catalog/hosting/$id"
                    params={{ id: item.id }}
                    className="block font-semibold text-[#11184c] hover:text-blue-600 hover:underline"
                  >
                    {item.name}
                  </Link>
                  <span className="block text-xs text-slate-500">
                    {item.code}
                  </span>
                  {item.description && (
                    <span className="block text-xs text-slate-500">
                      {item.description}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 text-slate-700">
                  {item.planName ?? '—'}
                  {item.planCount > 1 ? ` (+${item.planCount - 1})` : ''}
                </td>
                <td className="px-3 py-3 font-semibold text-[#11184c]">
                  {item.price ? (
                    <>
                      {formatPrice(item.price.amount, item.price.currency)}
                      <span className="block text-xs font-normal text-slate-500">
                        /
                        {cycleLabel[item.price.billingCycle] ??
                          item.price.billingCycle}
                      </span>
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-3 py-3">{item.provider ?? '—'}</td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : item.status === 'DRAFT' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {statusLabel[item.status] ?? item.status}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-slate-500">
                  {formatDate(item.createdAt)}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-12 text-center text-slate-500"
                >
                  {t('hosting.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>{t('hosting.showing', { from, to, total: meta.total })}</span>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={!meta.hasPrevious}
            onClick={() => onPageChange(meta.page - 1)}
            className="rounded border px-2 py-1 disabled:opacity-40"
            aria-label={t('hosting.previous')}
          >
            ‹
          </button>
          <span className="rounded bg-blue-600 px-2.5 py-1 text-white">
            {meta.page} / {Math.max(meta.totalPages, 1)}
          </span>
          <button
            type="button"
            disabled={!meta.hasNext}
            onClick={() => onPageChange(meta.page + 1)}
            className="rounded border px-2 py-1 disabled:opacity-40"
            aria-label={t('hosting.next')}
          >
            ›
          </button>
        </div>
      </div>
    </>
  )
}
