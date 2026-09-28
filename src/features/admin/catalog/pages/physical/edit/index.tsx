import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { usePhysicalPackage } from '../../../hooks/usePhysicalPackages'
import { PhysicalPackageFormPage } from '../components/PhysicalPackageFormPage'

export default function EditPhysicalPackagePage({ id }: { id: string }) {
  const { t } = useTranslation('catalog')
  const packageQuery = usePhysicalPackage(id)
  if (packageQuery.isPending)
    return (
      <p className="py-12 text-center text-slate-500">
        {t('physical.detail.loading')}
      </p>
    )
  if (packageQuery.isError)
    return (
      <div role="alert" className="rounded-xl bg-white p-6 text-red-600">
        <p>{t('physical.detail.loadFailed')}</p>
        <Link
          to="/admin/dashboard/catalog/physical"
          className="mt-3 inline-block text-blue-600 hover:underline"
        >
          {t('physical.detail.back')}
        </Link>
      </div>
    )
  return (
    <PhysicalPackageFormPage
      key={packageQuery.data.id}
      initialPackage={packageQuery.data}
    />
  )
}
