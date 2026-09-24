import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { VpsPackageForm } from '../../../components/vps/VpsPackageForm'

export default function NewVpsPackagePage() {
  const { t } = useTranslation('catalog')
  return <div className="mx-auto max-w-5xl space-y-5 text-slate-900"><div><Link to="/dashboard/catalog/vps" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"><ArrowLeft className="size-4" /> {t('vps.form.back')}</Link><p className="mb-1 text-xs font-medium text-slate-400">{t('vps.breadcrumb')}</p><h1 className="text-3xl font-bold tracking-tight text-[#11184c]">{t('vps.form.createTitle')}</h1><p className="mt-1 text-sm text-slate-500">{t('vps.form.createDescription')}</p></div><VpsPackageForm /></div>
}
