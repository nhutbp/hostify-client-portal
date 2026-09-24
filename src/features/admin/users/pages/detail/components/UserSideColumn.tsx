import { Activity, CalendarDays, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { detailPanel, formatUserDate } from './detailShared'
import type { AdminUserDetail } from '../../../types'

export function UserSideColumn({
  user,
  locale,
}: {
  user: AdminUserDetail
  locale: string
}) {
  const { t } = useTranslation('adminUsers')
  return (
    <aside className="space-y-4">
      <section className={`${detailPanel} p-5`}>
        <h2 className="mb-4 font-bold uppercase">
          {t('detail.accountStatus')}
        </h2>
        <div className="space-y-4 text-sm">
          <p className="flex gap-2">
            <CheckCircle2 className="size-5 text-emerald-600" />
            <span>
              {t(`statuses.${user.status}`)}
              <small className="mt-1 block text-slate-500">{user.email}</small>
            </span>
          </p>
          <p className="flex gap-2">
            <CalendarDays className="size-5 text-slate-500" />
            <span>
              {t('detail.joined')} {formatUserDate(user.createdAt, locale)}
            </span>
          </p>
          <p className="flex gap-2">
            <Activity className="size-5 text-blue-600" />
            <span>
              {t('detail.lastLogin')}
              <small className="mt-1 block text-slate-500">
                {formatUserDate(user.lastLoginAt, locale, true)}
              </small>
            </span>
          </p>
        </div>
      </section>
      <section className={`${detailPanel} p-5`}>
        <h2 className="mb-4 font-bold uppercase">
          {t('detail.recentActivity')}
        </h2>
        <div className="space-y-4">
          {user.activities.length
            ? user.activities.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="border-l-2 border-emerald-300 pl-3"
                >
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-slate-500">
                    {item.entityType} ·{' '}
                    {formatUserDate(item.createdAt, locale, true)}
                  </p>
                </div>
              ))
            : user.sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="border-l-2 border-blue-300 pl-3"
                >
                  <p className="text-sm font-medium">
                    {t('detail.loginActivity')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatUserDate(session.createdAt, locale, true)}
                  </p>
                </div>
              ))}
        </div>
        {!user.activities.length && !user.sessions.length && (
          <p className="text-sm text-slate-500">{t('detail.noActivity')}</p>
        )}
      </section>
    </aside>
  )
}
