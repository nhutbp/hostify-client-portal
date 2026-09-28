import { Server } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import type { VpsPackageList } from '../../services/vpsService'
import { cn } from '@/utils/utils'

type Props = {
  data: VpsPackageList
  onToggle: (id: string, status: 'ACTIVE' | 'DRAFT') => void
  isToggling: boolean
  onPageChange: (page: number) => void
}

export function VpsPlansTable({
  data,
  onToggle,
  isToggling,
  onPageChange,
}: Props) {
  const { t } = useTranslation('catalog')
  const { items, meta } = data
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1
  const to = Math.min(meta.page * meta.limit, meta.total)
  return (
    <>
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-3 py-3">#</th>
              <th>{t('vps.table.name')}</th>
              <th>{t('vps.table.configuration')}</th>
              <th>{t('vps.table.price')}</th>
              <th>{t('vps.table.provider')}</th>
              <th>{t('vps.table.location')}</th>
              <th>{t('vps.table.status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <tr key={item.id} className="hover:bg-blue-50/40">
                <td className="px-3 py-3 text-slate-500">{from + index}</td>
                <td className="px-3 py-3">
                  <span className="block font-bold text-[#11184c]">
                    <Link
                      to="/dashboard/catalog/vps/$id"
                      params={{ id: item.id }}
                      className="hover:text-blue-600 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                      {item.name}
                    </Link>{' '}
                    {item.featured && (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-600">
                        {t('vps.table.popular')}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-slate-500">
                    {item.description}
                  </span>
                </td>
                <td className="whitespace-nowrap leading-5 text-slate-500">
                  {item.cpu ? `${item.cpu} vCPU` : '—'}
                  <br />
                  {item.ramGb ? `${item.ramGb} GB RAM` : '—'}
                  <br />
                  {item.diskGb ? `${item.diskGb} GB ${item.diskType}` : '—'}
                </td>
                <td className="whitespace-nowrap font-bold text-[#11184c]">
                  {item.monthlyPrice == null
                    ? '—'
                    : item.monthlyPrice.toLocaleString('en-US')}
                  <br />
                  <span className="font-normal text-slate-500">
                    {t('vps.table.perMonth')}
                  </span>
                </td>
                <td className="whitespace-nowrap">
                  <span className="mr-1 inline-flex size-6 items-center justify-center rounded-full bg-blue-500 text-white">
                    <Server className="size-3" />
                  </span>
                  {item.provider || '—'}
                </td>
                <td className="whitespace-nowrap">
                  {item.countryCode && (
                    <span className="mr-1">
                      {(
                        {
                          VN: '🇻🇳',
                          SG: '🇸🇬',
                          JP: '🇯🇵',
                          US: '🇺🇸',
                          DE: '🇩🇪',
                        } as Record<string, string>
                      )[item.countryCode] ?? ''}
                    </span>
                  )}
                  {item.location || '—'}
                </td>
                <td>
                  <button
                    type="button"
                    aria-label={`${t('vps.table.status')}: ${item.name}`}
                    aria-pressed={item.status === 'ACTIVE'}
                    disabled={isToggling}
                    onClick={() =>
                      onToggle(
                        item.id,
                        item.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE',
                      )
                    }
                    className={cn(
                      'relative h-5 w-9 rounded-full transition disabled:opacity-50',
                      item.status === 'ACTIVE' ? 'bg-blue-600' : 'bg-slate-300',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 size-3 rounded-full bg-white transition',
                        item.status === 'ACTIVE' ? 'left-5' : 'left-1',
                      )}
                    />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-12 text-center text-slate-500"
                >
                  {t('vps.table.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>{t('vps.table.showing', { from, to, total: meta.total })}</span>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={!meta.hasPrevious}
            onClick={() => onPageChange(meta.page - 1)}
            className="rounded border px-2 py-1 disabled:opacity-40"
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
          >
            ›
          </button>
        </div>
      </div>
    </>
  )
}
