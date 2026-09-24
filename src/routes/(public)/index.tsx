import { Link, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/(public)/')({
  head: () => ({ meta: [{ title: 'Trang chủ' }] }),
  component: HomeRoute,
})

function HomeRoute() {
  const { t } = useTranslation()
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold">{t('base.welcome')}</h1>
      <p className="text-slate-500">{t('base.description')}</p>
      <div className="flex gap-3">
        <Link to="/login" className="rounded-lg border px-5 py-2">
          {t('base.login')}
        </Link>
        <Link
          to="/dashboard"
          className="rounded-lg bg-primary px-5 py-2 text-white"
        >
          {t('base.dashboard')}
        </Link>
      </div>
    </main>
  )
}
