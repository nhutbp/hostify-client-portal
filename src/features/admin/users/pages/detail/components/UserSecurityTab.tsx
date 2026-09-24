import {
  KeyRound,
  Laptop,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AdminUserDetail } from '../../../types'
import { useAdminUserMutations } from '../../../hooks/useAdminUsers'
import { Button } from '@/components/ui/button'
import { toast } from '@/utils/toast'

const panel =
  'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900'

function deviceLabel(deviceInfo: unknown) {
  if (!deviceInfo || typeof deviceInfo !== 'object') return '—'
  const data = deviceInfo as Record<string, unknown>
  return (
    [data.device, data.browser, data.os, data.userAgent]
      .filter((value): value is string => typeof value === 'string')
      .slice(0, 2)
      .join(' · ') || '—'
  )
}

export function UserSecurityTab({
  user,
  locale,
  onResetPassword,
  onToggleStatus,
}: {
  user: AdminUserDetail
  locale: string
  onResetPassword: () => void
  onToggleStatus: () => void
}) {
  const { t } = useTranslation('adminUsers')
  const { revokeSessions } = useAdminUserMutations()
  const revoke = async (sessionId?: string) => {
    try {
      await revokeSessions.mutateAsync({
        id: user.id,
        ...(sessionId ? { sessionId } : {}),
      })
      toast.success(t('detail.securityTab.revokeSuccess'))
    } catch (error) {
      toast.apiError(error, t('detail.securityTab.revokeFailed'))
    }
  }
  const active = user.sessions.filter((session) => !session.revokedAt)
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
      <main className="space-y-4">
        <section className={`${panel} p-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold uppercase">
                {t('detail.securityTab.passwordAuth')}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {t('detail.passwordDescription')}
              </p>
            </div>
            <Button variant="outline" onClick={onResetPassword}>
              <KeyRound className="mr-2 size-4" />
              {t('detail.resetPassword')}
            </Button>
          </div>
          <div className="mt-5 grid gap-3 border-t pt-5 sm:grid-cols-2">
            <div className="flex gap-3">
              <ShieldCheck className="size-5 text-emerald-700" />
              <div>
                <strong className="text-sm">
                  {t('detail.securityTab.accountProtection')}
                </strong>
                <p className="text-xs text-slate-500">
                  {t(`statuses.${user.status}`)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <KeyRound className="size-5 text-blue-600" />
              <div>
                <strong className="text-sm">
                  {t('detail.securityTab.assignedPermissions')}
                </strong>
                <p className="text-xs text-slate-500">
                  {user.permissions.length}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className={`${panel} overflow-hidden`}>
          <div className="flex items-center justify-between border-b p-5">
            <h2 className="font-bold uppercase">
              {t('detail.securityTab.activeSessions')}
            </h2>
            {active.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => revoke()}
                disabled={revokeSessions.isPending}
              >
                <LogOut className="mr-2 size-4" />
                {t('detail.securityTab.revokeAll')}
              </Button>
            )}
          </div>
          <div className="divide-y">
            {user.sessions.map((session, index) => (
              <div
                key={session.id}
                className="grid items-center gap-3 p-4 sm:grid-cols-[40px_1fr_180px_110px]"
              >
                <span className="grid size-9 place-items-center rounded-lg bg-slate-100">
                  {index % 2 ? (
                    <Smartphone className="size-5" />
                  ) : (
                    <Laptop className="size-5" />
                  )}
                </span>
                <div>
                  <strong className="block text-sm">
                    {deviceLabel(session.deviceInfo)}
                  </strong>
                  <small className="text-slate-500">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    }).format(new Date(session.createdAt))}
                  </small>
                </div>
                <span className="text-xs text-slate-500">
                  {t('detail.securityTab.expires')}{' '}
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: 'short',
                  }).format(new Date(session.accessTokenExpires))}
                </span>
                {session.revokedAt ? (
                  <span className="text-xs text-red-600">
                    {t('detail.revoked')}
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revoke(session.id)}
                    disabled={revokeSessions.isPending}
                  >
                    {t('detail.securityTab.signOut')}
                  </Button>
                )}
              </div>
            ))}
          </div>
          {!user.sessions.length && (
            <p className="p-8 text-center text-sm text-slate-500">
              {t('detail.securityTab.noSessions')}
            </p>
          )}
        </section>
      </main>
      <aside className="space-y-4">
        <section className={`${panel} p-5`}>
          <h3 className="mb-4 font-bold uppercase">
            {t('detail.securityTab.securitySummary')}
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span>{t('detail.securityTab.activeSessions')}</span>
              <strong>{active.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>{t('detail.securityTab.roles')}</span>
              <strong>{user.roleCodes.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>{t('detail.securityTab.permissions')}</span>
              <strong>{user.permissions.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>{t('detail.securityTab.lastLogin')}</span>
              <strong>
                {user.lastLoginAt
                  ? new Intl.DateTimeFormat(locale, {
                      dateStyle: 'short',
                    }).format(new Date(user.lastLoginAt))
                  : '—'}
              </strong>
            </div>
          </div>
        </section>
        <section className={`${panel} border-red-200 p-5`}>
          <h3 className="mb-4 font-bold uppercase text-red-700">
            {t('detail.securityTab.dangerZone')}
          </h3>
          <Button
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={onToggleStatus}
          >
            <LockKeyhole className="mr-2 size-4" />
            {user.status === 'BLOCKED'
              ? t('actions.unlock')
              : t('actions.lock')}
          </Button>
        </section>
      </aside>
    </div>
  )
}
