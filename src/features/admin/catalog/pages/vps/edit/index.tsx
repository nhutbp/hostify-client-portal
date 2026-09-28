import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useVpsPackage } from '../../../hooks/useVpsPackage'
import { VpsPackageFormPage } from '../components/VpsPackageFormPage'

export default function EditVpsPackagePage({ id }: { id: string }) {
  const { t } = useTranslation('catalog')
  const packageQuery = useVpsPackage(id)

  if (packageQuery.isPending)
    return (
      <p className="py-12 text-center text-slate-500">
        {t('vps.detail.loading')}
      </p>
    )
  if (packageQuery.isError)
    return (
      <div role="alert" className="rounded-xl bg-white p-6 text-red-600">
        <p>{t('vps.detail.loadFailed')}</p>
        <Link
          to="/dashboard/catalog/vps"
          className="mt-3 inline-block text-blue-600 hover:underline"
        >
          {t('vps.detail.back')}
        </Link>
      </div>
    )
  return <VpsPackageFormPage initialPackage={packageQuery.data} />
}
