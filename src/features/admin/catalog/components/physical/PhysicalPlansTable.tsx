import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import type { PhysicalPackageList } from '../../services/physicalService'

export function PhysicalPlansTable({
  data,
  onPageChange,
}: {
  data: PhysicalPackageList
  onPageChange: (page: number) => void
}) {
  const { t, i18n } = useTranslation('catalog')
  const { items, meta } = data
  const from = meta.total ? (meta.page - 1) * meta.limit + 1 : 0
  const to = Math.min(meta.page * meta.limit, meta.total)
  const formatPrice = (amount: number, currency: string) =>
    new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  return (
    <>
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-3 py-3">#</th>
              <th className="px-3 py-3">{t('physical.name')}</th>
              <th className="px-3 py-3">{t('physical.configuration')}</th>
              <th className="px-3 py-3">{t('physical.price')}</th>
              <th className="px-3 py-3">{t('physical.provider')}</th>
              <th className="px-3 py-3">{t('physical.status')}</th>
              <th className="px-3 py-3">{t('physical.createdAt')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <tr key={item.id} className="hover:bg-blue-50/40">
                <td className="px-3 py-3 text-slate-500">{from + index}</td>
                <td className="px-3 py-3">
                  <Link
                    to="/dashboard/catalog/physical/$id"
                    params={{ id: item.id }}
                    className="font-semibold text-[#11184c] hover:text-blue-600 hover:underline"
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
                  {item.cpuModel || '—'} · {item.cpuCores}{' '}
                  {t('physical.new.cores')}
                  <span className="block text-xs text-slate-500">
                    {item.ramGb} GB RAM · {item.storageGb} GB {item.storageType}
                  </span>
                </td>
                <td className="px-3 py-3 font-semibold text-[#11184c]">
                  {item.price ? (
                    <>
                      {formatPrice(item.price.amount, item.price.currency)}
                      <span className="block text-xs font-normal text-slate-500">
                        /{t('physical.monthly')}
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
                    {t(
                      item.status === 'ACTIVE'
                        ? 'physical.active'
                        : item.status === 'DRAFT'
                          ? 'physical.draft'
                          : 'physical.archived',
                    )}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                  {new Intl.DateTimeFormat(i18n.language, {
                    dateStyle: 'medium',
                  }).format(new Date(item.createdAt))}
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-12 text-center text-slate-500"
                >
                  {t('physical.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>{t('physical.showing', { from, to, total: meta.total })}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!meta.hasPrevious}
            onClick={() => onPageChange(meta.page - 1)}
            className="rounded border px-2 py-1 disabled:opacity-40"
            aria-label={t('physical.previous')}
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
            aria-label={t('physical.next')}
          >
            ›
          </button>
        </div>
      </div>
    </>
  )
}
