import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { rolePanel } from './rolesShared'
import type { AdminManagedRole } from '../../../types'

export function RoleSummarySidebar({
  selected,
  permissionCount,
  draftPermissions,
}: {
  selected?: AdminManagedRole
  permissionCount: number
  draftPermissions: string[]
}) {
  const { t } = useTranslation('adminUsers')
  const grantedPercent = permissionCount
    ? Math.round((draftPermissions.length / permissionCount) * 100)
    : 0
  return (
    <aside className="space-y-3">
      <section className={`${rolePanel} p-4`}>
        <h3 className="text-xs font-bold uppercase">
          {t('roleManagement.summary')}
        </h3>
        <div className="mt-4 flex items-center gap-4">
          <div
            className="grid size-24 shrink-0 place-items-center rounded-full"
            style={{
              background: `conic-gradient(var(--primary) ${grantedPercent}%, #e5e7eb ${grantedPercent}% 100%)`,
            }}
          >
            <div className="grid size-16 place-items-center rounded-full bg-white text-center">
              <span>
                <strong className="block text-base">
                  {draftPermissions.length}/{permissionCount}
                </strong>
                <small className="text-[10px] text-slate-500">
                  {t('roleManagement.permissions')}
                </small>
              </span>
            </div>
          </div>
          <div className="min-w-0 space-y-2 text-[11px]">
            <p className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              {t('roleManagement.granted')}{' '}
              <b className="ml-auto">{draftPermissions.length}</b>
            </p>
            <p className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-slate-300" />
              {t('roleManagement.notGranted')}{' '}
              <b className="ml-auto">
                {permissionCount - draftPermissions.length}
              </b>
            </p>
          </div>
        </div>
      </section>
      <section className={`${rolePanel} p-4`}>
        <h3 className="mb-3 text-xs font-bold uppercase">
          {t('roleManagement.assignedUsers')}
        </h3>
        <div className="space-y-2.5">
          {selected?.users.slice(0, 5).map((user) => (
            <Link
              key={user.id}
              to="/dashboard/users/$userId"
              params={{ userId: user.id }}
              className="flex items-center gap-2.5 rounded-md p-1 hover:bg-primary-50"
            >
              <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100 text-[10px]">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  user.name.slice(0, 2).toUpperCase()
                )}
              </span>
              <span className="min-w-0">
                <strong className="block truncate text-xs">{user.name}</strong>
                <small className="block truncate text-[10px] text-slate-500">
                  {selected.name}
                </small>
              </span>
            </Link>
          ))}
          {!selected?.users.length && (
            <p className="text-xs text-slate-500">
              {t('roleManagement.noUsers')}
            </p>
          )}
        </div>
        {selected && selected.userCount > selected.users.length && (
          <p className="mt-3 text-center text-[11px] text-primary-700">
            +{selected.userCount - selected.users.length}{' '}
            {t('roleManagement.moreUsers')}
          </p>
        )}
      </section>
    </aside>
  )
}
