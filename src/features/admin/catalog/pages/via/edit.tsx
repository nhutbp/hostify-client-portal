import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useViaPackage } from '../../hooks/useViaPackages'
import { ViaPackageFormPage } from './components/ViaPackageFormPage'
export default function EditViaPackagePage({ id }: { id: string }) {
  const { t } = useTranslation('catalog')
  const query = useViaPackage(id)
  if (query.isPending)
    return (
      <p className="py-12 text-center text-slate-500">
        {t('via.detail.loading')}
      </p>
    )
  if (query.isError)
    return (
      <div role="alert" className="rounded-xl bg-white p-6 text-red-600">
        <p>{t('via.detail.loadFailed')}</p>
        <Link
          to="/admin/dashboard/catalog/via"
          className="mt-3 inline-block text-blue-600"
        >
          {t('via.detail.back')}
        </Link>
      </div>
    )
  return <ViaPackageFormPage key={query.data.id} initialPackage={query.data} />
}
