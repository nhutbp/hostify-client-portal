import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { VpsPackageForm } from '../../../components/vps/VpsPackageForm'
import './new-vps.css'

export default function NewVpsPackagePage() {
  const { t } = useTranslation('catalog')
  return (
    <div className="vps-create-page -mx-4 min-h-[calc(100vh-58px)] px-4 pb-4 pt-2.5 md:-mx-7 md:-my-7 md:px-4 md:pb-4 md:pt-2.5">
      <nav
        aria-label="Breadcrumb"
        className="mb-2 flex items-center gap-1.5 text-xs text-[#475778]"
      >
        <span>VPS</span>
        <ChevronRight className="size-3" />
        <Link to="/dashboard/catalog/vps" className="hover:text-blue-600">
          Danh sách gói
        </Link>
        <ChevronRight className="size-3" />
        <span className="font-semibold text-[#101945]">
          {t('vps.form.createTitle')}
        </span>
      </nav>
      <header className="mb-2">
        <h1 className="text-[29px] font-bold leading-tight text-[#101945]">
          {t('vps.form.createTitle')}
        </h1>
        <p className="mt-1 text-sm text-[#4b5d7d]">
          {t('vps.form.createDescription')}
        </p>
      </header>
      <VpsPackageForm />
    </div>
  )
}
