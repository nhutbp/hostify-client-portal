import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useHostingPackage } from '../../../hooks/useHostingPackages'
import { HostingPackageFormPage } from '../components/HostingPackageFormPage'

export default function EditHostingPackagePage({ id }: { id: string }) {
  const { t } = useTranslation('catalog')
  const packageQuery = useHostingPackage(id)
  if (packageQuery.isPending)
    return (
      <p className="py-12 text-center text-slate-500">
        {t('hosting.detail.loading')}
      </p>
    )
  if (packageQuery.isError)
    return (
      <div role="alert" className="rounded-xl bg-white p-6 text-red-600">
        <p>{t('hosting.detail.loadFailed')}</p>
        <Link
          to="/admin/dashboard/catalog/hosting"
          className="mt-3 inline-block text-blue-600 hover:underline"
        >
          {t('hosting.detail.back')}
        </Link>
      </div>
    )
  return (
    <HostingPackageFormPage
      key={packageQuery.data.id}
      initialPackage={packageQuery.data}
    />
  )
}
