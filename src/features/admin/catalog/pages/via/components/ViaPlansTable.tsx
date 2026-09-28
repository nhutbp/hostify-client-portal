import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ViaPackageList } from '../../../services/viaService'

export function ViaPlansTable({
  data,
  onPageChange,
}: {
  data: ViaPackageList
  onPageChange: (page: number) => void
}) {
  const { t, i18n } = useTranslation('catalog')
  const { items, meta } = data
  return (
    <>
      <div className="mt-5 overflow-x-auto rounded-xl border border-[#d5e1f2] bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">{t('via.name')}</th>
              <th className="px-4 py-3">{t('via.configuration')}</th>
              <th className="px-4 py-3">{t('via.price')}</th>
              <th className="px-4 py-3">{t('via.provider')}</th>
              <th className="px-4 py-3">{t('via.status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <tr key={item.id}>
                <td className="px-4 py-4 text-slate-500">
                  {(meta.page - 1) * meta.limit + index + 1}
                </td>
                <td className="px-4 py-4">
                  <Link
                    to="/dashboard/catalog/via/$id"
                    params={{ id: item.id }}
                    className="font-semibold text-[#11184c] hover:text-blue-600 hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 max-w-80 truncate text-xs text-slate-500">
                    {item.description}
                  </p>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {t(`via.options.platform.${item.platform}`)} ·{' '}
                  {t(`via.options.accountType.${item.accountType}`)}
                  <br />
                  {t(`via.options.country.${item.country}`)} ·{' '}
                  {t(`via.options.verification.${item.verification}`)}
                </td>
                <td className="px-4 py-4 font-semibold text-[#11184c]">
                  {item.price
                    ? `${item.price.amount.toLocaleString(i18n.language)} ₫/${t('via.account')}`
                    : '—'}
                </td>
                <td className="px-4 py-4">{item.provider ?? '—'}</td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : item.status === 'DRAFT' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {t(
                      item.status === 'ACTIVE'
                        ? 'via.active'
                        : item.status === 'DRAFT'
                          ? 'via.draft'
                          : 'via.archived',
                    )}
                  </span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-14 text-center text-slate-500"
                >
                  {t('via.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <p>
          {t('via.showing', {
            from: meta.total ? (meta.page - 1) * meta.limit + 1 : 0,
            to: Math.min(meta.page * meta.limit, meta.total),
            total: meta.total,
          })}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t('via.previous')}
            disabled={!meta.hasPrevious}
            onClick={() => onPageChange(meta.page - 1)}
            className="rounded border border-slate-200 p-2 disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="rounded bg-blue-600 px-3 py-2 text-white">
            {meta.page} / {Math.max(meta.totalPages, 1)}
          </span>
          <button
            type="button"
            aria-label={t('via.next')}
            disabled={!meta.hasNext}
            onClick={() => onPageChange(meta.page + 1)}
            className="rounded border border-slate-200 p-2 disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </>
  )
}
