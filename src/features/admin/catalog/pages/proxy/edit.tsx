import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useProxyPackage } from '../../hooks/useProxyPackages'
import { ProxyPackageFormPage } from './components/ProxyPackageFormPage'
export default function EditProxyPackagePage({ id }: { id: string }) {
  const { t } = useTranslation('catalog')
  const query = useProxyPackage(id)
  if (query.isPending)
    return (
      <p className="py-12 text-center text-slate-500">
        {t('proxy.detail.loading')}
      </p>
    )
  if (query.isError)
    return (
      <div role="alert" className="rounded-xl bg-white p-6 text-red-600">
        <p>{t('proxy.detail.loadFailed')}</p>
        <Link
          to="/admin/dashboard/catalog/proxy"
          className="mt-3 inline-block text-blue-600"
        >
          {t('proxy.detail.back')}
        </Link>
      </div>
    )
  return (
    <ProxyPackageFormPage key={query.data.id} initialPackage={query.data} />
  )
}
