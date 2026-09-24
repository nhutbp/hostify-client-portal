import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useCurrentUser } from '@/features/auth/store/authStore'

export default function DashboardPage() {
  const user = useCurrentUser()
  const { t } = useTranslation()

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('base.dashboard')}</h1>
        <p className="mt-2 text-slate-500">
          {t('base.greeting', { name: user?.displayName || t('base.you') })}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to="/dashboard/users" className="rounded-lg border px-4 py-3">
          {t('base.users')}
        </Link>
        <Link to="/dashboard/media" className="rounded-lg border px-4 py-3">
          {t('base.media')}
        </Link>
        <Link to="/dashboard/settings" className="rounded-lg border px-4 py-3">
          {t('base.settings')}
        </Link>
      </div>
    </main>
  )
}
