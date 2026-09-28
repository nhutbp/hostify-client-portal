import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ProxyPackageList } from '../../../services/proxyService'

export function ProxyPlansTable({
  data,
  onPageChange,
}: {
  data: ProxyPackageList
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
              <th className="px-4 py-3">{t('proxy.name')}</th>
              <th className="px-4 py-3">{t('proxy.configuration')}</th>
              <th className="px-4 py-3">{t('proxy.price')}</th>
              <th className="px-4 py-3">{t('proxy.provider')}</th>
              <th className="px-4 py-3">{t('proxy.status')}</th>
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
                    to="/admin/dashboard/catalog/proxy/$id"
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
                  <span>{t(`proxy.types.${item.proxyType}`)}</span>
                  <br />
                  <span>
                    {t(`proxy.countries.${item.country}`)} ·{' '}
                    {t(`proxy.modes.${item.ipMode}`)}
                  </span>
                  <br />
                  <span>{item.protocols.join(', ')}</span>
                </td>
                <td className="px-4 py-4 font-semibold text-[#11184c]">
                  {item.price
                    ? `${item.price.amount.toLocaleString(i18n.language)} ₫/${t('proxy.monthly')}`
                    : '—'}
                </td>
                <td className="px-4 py-4">{item.provider ?? '—'}</td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : item.status === 'DRAFT' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {t(
                      item.status === 'ACTIVE'
                        ? 'proxy.active'
                        : item.status === 'DRAFT'
                          ? 'proxy.draft'
                          : 'proxy.archived',
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
                  {t('proxy.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <p>
          {t('proxy.showing', {
            from: meta.total ? (meta.page - 1) * meta.limit + 1 : 0,
            to: Math.min(meta.page * meta.limit, meta.total),
            total: meta.total,
          })}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t('proxy.previous')}
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
            aria-label={t('proxy.next')}
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
