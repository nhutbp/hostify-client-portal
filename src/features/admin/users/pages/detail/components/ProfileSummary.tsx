import { CalendarDays, ImagePlus, Mail, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { detailPanel, formatUserDate } from './detailShared'
import type { AdminUserDetail } from '../../../types'

export function ProfileSummary({
  user,
  locale,
  canUpdate = false,
  onAvatarClick,
}: {
  user: AdminUserDetail
  locale: string
  canUpdate?: boolean
  onAvatarClick?: () => void
}) {
  const { t } = useTranslation('adminUsers')
  void locale
  return (
    <section
      className={`${detailPanel} flex flex-col gap-5 p-5 lg:flex-row lg:items-center`}
    >
      <div className="relative grid size-24 shrink-0 place-items-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="size-full rounded-full object-cover"
          />
        ) : (
          user.displayName.slice(0, 2).toUpperCase()
        )}
        {canUpdate && onAvatarClick ? (
          <button
            type="button"
            onClick={onAvatarClick}
            aria-label={t('editor.fields.avatarUrl')}
            className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full border-2 border-white bg-primary text-white shadow-sm transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <ImagePlus className="size-4" />
          </button>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {user.displayName}
          </h1>
          <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
            {user.roleCodes.join(', ') || t('roles.CUSTOMER')}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
            <i
              className={`size-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : user.status === 'BLOCKED' ? 'bg-red-500' : 'bg-amber-500'}`}
            />
            {t(`statuses.${user.status}`)}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          ID: {user.code} · @{user.login}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <Mail className="size-4" />
            {user.email}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Phone className="size-4" />
            {user.phone || '—'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {t('detail.joined')} {formatUserDate(user.createdAt, locale)}
          </span>
        </div>
      </div>
      <div className="grid shrink-0 grid-cols-1 text-center">
        <div className="px-5">
          <strong className="block text-xl">
            {user.sessions.filter((session) => !session.revokedAt).length}
          </strong>
          <span className="text-xs text-slate-500">
            {t('detail.activeSessions')}
          </span>
        </div>
      </div>
    </section>
  )
}
