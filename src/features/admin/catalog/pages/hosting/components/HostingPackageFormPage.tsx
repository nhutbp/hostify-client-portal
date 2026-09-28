import { Link } from '@tanstack/react-router'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { HostingBasicSection } from '../new/components/HostingBasicSection'
import { HostingPreviewSection } from '../new/components/HostingPreviewSection'
import { HostingSettingsSection } from '../new/components/HostingSettingsSection'
import { HostingDetailsTabs } from '../new/components/HostingDetailsTabs'
import { useHostingPackageForm } from '../new/components/useHostingPackageForm'
import type { HostingPackageDetail } from '../../../services/hostingService'
import '../new/new-hosting.css'

export function HostingPackageFormPage({
  initialPackage,
}: {
  initialPackage?: HostingPackageDetail
}) {
  const { t } = useTranslation('catalog')
  const isEdit = Boolean(initialPackage)
  const {
    form,
    update,
    onNameChange,
    onSlugChange,
    onSubmit,
    providers,
    isSaving,
    error,
    errorTab,
    validationAttempt,
  } = useHostingPackageForm(initialPackage)

  return (
    <div className="hosting-new-page -mx-4 min-h-[calc(100vh-58px)] px-4 pb-8 pt-3 md:-mx-7 md:-my-7 md:px-5 md:pt-4">
      <nav
        aria-label="Breadcrumb"
        className="mb-2 flex flex-wrap items-center gap-1.5 text-sm text-[#6a7d9f]"
      >
        <span>{t('hosting.breadcrumb')}</span>
        <ChevronRight className="size-3.5" />
        <span>{t(isEdit ? 'hosting.edit.title' : 'hosting.new.title')}</span>
      </nav>
      <header className="mb-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            to={
              isEdit
                ? '/dashboard/catalog/hosting/$id'
                : '/dashboard/catalog/hosting'
            }
            params={initialPackage ? { id: initialPackage.id } : undefined}
            aria-label={t('hosting.new.cancel')}
            className="flex size-11 shrink-0 items-center justify-center rounded-md border border-[#d5e1f2] bg-white text-[#11184c] hover:text-blue-600"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#11184c]">
              {t(isEdit ? 'hosting.edit.title' : 'hosting.new.title')}
            </h1>
            <p className="mt-1 text-base text-[#667a9b]">
              {t(isEdit ? 'hosting.edit.subtitle' : 'hosting.new.subtitle')}
            </p>
          </div>
        </div>
      </header>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <form
        id="hosting-create-form"
        onSubmit={onSubmit}
        noValidate
        className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]"
      >
        <div className="min-w-0 space-y-4">
          <HostingBasicSection
            form={form}
            update={update}
            onNameChange={onNameChange}
            onSlugChange={onSlugChange}
          />
          <HostingDetailsTabs
            form={form}
            update={update}
            providers={providers}
            errorTab={errorTab}
            validationAttempt={validationAttempt}
          />
        </div>
        <div className="min-w-0 space-y-4">
          <HostingSettingsSection
            form={form}
            update={update}
            isSaving={isSaving}
            canSave={providers.length > 0}
            initialPackageId={initialPackage?.id}
          />
          <HostingPreviewSection form={form} isEdit={isEdit} />
        </div>
      </form>
    </div>
  )
}
