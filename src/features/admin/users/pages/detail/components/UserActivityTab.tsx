import { useMemo, useState } from 'react'
import { Activity, Download, Search, ShieldCheck, UserCog } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AdminUserDetail } from '../../../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const panel =
  'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900'

function stringify(value: unknown) {
  if (value == null) return ''
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function UserActivityTab({
  user,
  locale,
}: {
  user: AdminUserDetail
  locale: string
}) {
  const { t } = useTranslation('adminUsers')
  const [search, setSearch] = useState('')
  const [module, setModule] = useState('ALL')
  const [expanded, setExpanded] = useState<string>()
  const modules = [...new Set(user.activities.map((item) => item.entityType))]
  const rows = useMemo(
    () =>
      user.activities.filter(
        (item) =>
          (!search.trim() ||
            `${item.action} ${item.entityType}`
              .toLowerCase()
              .includes(search.toLowerCase())) &&
          (module === 'ALL' || item.entityType === module),
      ),
    [module, search, user.activities],
  )
  const exportLog = () => {
    const csv =
      '\uFEFF' +
      [
        ['Action', 'Module', 'IP', 'User agent', 'Created at'],
        ...rows.map((item) => [
          item.action,
          item.entityType,
          item.ipAddress ?? '',
          item.userAgent ?? '',
          new Date(item.createdAt).toISOString(),
        ]),
      ]
        .map((row) =>
          row
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(','),
        )
        .join('\n')
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `user-${user.code}-activities.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
      <main className={`${panel} overflow-hidden`}>
        <div className="border-b p-5">
          <h2 className="font-bold uppercase">
            {t('detail.activityTab.title')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t('detail.activityTab.description')}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="relative min-w-56 flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('detail.activityTab.search')}
                className="pl-9"
              />
            </div>
            <select
              className="h-10 rounded-lg border bg-white px-3 pr-9 text-sm"
              value={module}
              onChange={(e) => setModule(e.target.value)}
            >
              <option value="ALL">{t('detail.activityTab.allModules')}</option>
              {modules.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <Button variant="outline" onClick={exportLog}>
              <Download className="mr-2 size-4" />
              {t('detail.activityTab.export')}
            </Button>
          </div>
        </div>
        <div className="divide-y">
          {rows.map((item) => (
            <article key={item.id} className="p-4">
              <button
                type="button"
                onClick={() =>
                  setExpanded(expanded === item.id ? undefined : item.id)
                }
                className="grid w-full items-center gap-3 text-left sm:grid-cols-[36px_1fr_170px_160px]"
              >
                <span className="grid size-9 place-items-center rounded-full bg-emerald-50">
                  <Activity className="size-4 text-emerald-700" />
                </span>
                <span>
                  <strong className="block text-sm">{item.action}</strong>
                  <small className="text-slate-500">{item.entityType}</small>
                </span>
                <small className="text-slate-500">
                  {item.ipAddress || '—'}
                </small>
                <small className="text-slate-500">
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  }).format(new Date(item.createdAt))}
                </small>
              </button>
              {expanded === item.id && (
                <div className="mt-3 grid gap-3 rounded-lg bg-slate-50 p-4 text-xs sm:grid-cols-2">
                  <div>
                    <strong>{t('detail.activityTab.before')}</strong>
                    <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap text-slate-600">
                      {stringify(item.before) || '—'}
                    </pre>
                  </div>
                  <div>
                    <strong>{t('detail.activityTab.after')}</strong>
                    <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap text-slate-600">
                      {stringify(item.after) || '—'}
                    </pre>
                  </div>
                  <p className="sm:col-span-2 text-slate-500">
                    User agent: {item.userAgent || '—'}
                  </p>
                </div>
              )}
            </article>
          ))}
          {!rows.length && (
            <p className="p-8 text-center text-sm text-slate-500">
              {t('detail.noActivity')}
            </p>
          )}
        </div>
      </main>
      <aside className="space-y-4">
        <section className={`${panel} p-5`}>
          <h3 className="mb-4 font-bold uppercase">
            {t('detail.activityTab.statistics')}
          </h3>
          <div className="space-y-4">
            {[
              [
                Activity,
                t('detail.activityTab.login'),
                user.sessions.length,
                'text-emerald-600',
              ],
              [
                UserCog,
                t('detail.activityTab.admin'),
                user.activities.filter((item) =>
                  /user|role|permission/i.test(
                    `${item.entityType} ${item.action}`,
                  ),
                ).length,
                'text-blue-600',
              ],
              [
                ShieldCheck,
                t('detail.security'),
                user.activities.filter((item) =>
                  /security|password|session/i.test(
                    `${item.entityType} ${item.action}`,
                  ),
                ).length,
                'text-red-600',
              ],
            ].map(([Icon, label, value, color]) => {
              const IconComponent = Icon as LucideIcon
              return (
                <div key={String(label)} className="flex items-center gap-3">
                  <IconComponent className={`size-5 ${color}`} />
                  <span className="flex-1 text-sm">{String(label)}</span>
                  <strong>{String(value)}</strong>
                </div>
              )
            })}
          </div>
        </section>
        <section className={`${panel} p-5`}>
          <h3 className="mb-4 font-bold uppercase">
            {t('detail.activityTab.storage')}
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>{t('detail.activityTab.auditRecords')}</span>
              <strong>{user.activities.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>{t('detail.activityTab.sessionRecords')}</span>
              <strong>{user.sessions.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>{t('detail.activityTab.oldest')}</span>
              <strong>
                {user.activities.length
                  ? new Intl.DateTimeFormat(locale, {
                      dateStyle: 'short',
                    }).format(
                      new Date(
                        user.activities[user.activities.length - 1].createdAt,
                      ),
                    )
                  : '—'}
              </strong>
            </div>
          </div>
        </section>
      </aside>
    </div>
  )
}
