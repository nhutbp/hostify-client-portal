import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProxyBasicSection } from './ProxyBasicSection'
import { ProxyDetailsTabs } from './ProxyDetailsTabs'
import { ProxySettingsSection } from './ProxySettingsSection'
import { ProxyPreviewSection } from './ProxyPreviewSection'
import { useProxyPackageForm } from './useProxyPackageForm'
import type { ProxyPackageDetail } from '../../../services/proxyService'

export function ProxyPackageFormPage({
  initialPackage,
}: {
  initialPackage?: ProxyPackageDetail
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
  } = useProxyPackageForm(initialPackage)
  return (
    <div className="-mx-4 min-h-[calc(100vh-58px)] px-4 pb-8 pt-3 md:-mx-7 md:-my-7 md:px-5 md:pt-4">
      <p className="mb-2 text-sm text-[#6a7d9f]">
        {t(isEdit ? 'proxy.edit.breadcrumb' : 'proxy.new.breadcrumb')}
      </p>
      <header className="mb-5 flex flex-wrap items-center gap-4">
        <Link
          to={
            isEdit ? '/dashboard/catalog/proxy/$id' : '/dashboard/catalog/proxy'
          }
          params={initialPackage ? { id: initialPackage.id } : undefined}
          aria-label={t('proxy.new.cancel')}
          className="flex size-11 items-center justify-center rounded-md border border-[#d5e1f2] bg-white"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#11184c]">
            {t(isEdit ? 'proxy.edit.title' : 'proxy.new.title')}
          </h1>
          <p className="mt-1 text-base text-[#667a9b]">
            {t(isEdit ? 'proxy.edit.subtitle' : 'proxy.new.subtitle')}
          </p>
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
        id="proxy-package-form"
        onSubmit={onSubmit}
        noValidate
        className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]"
      >
        <div className="min-w-0 space-y-4">
          <ProxyBasicSection
            form={form}
            update={update}
            onNameChange={onNameChange}
            onSlugChange={onSlugChange}
          />
          <ProxyDetailsTabs
            form={form}
            update={update}
            providers={providers}
            errorTab={errorTab}
            validationAttempt={validationAttempt}
          />
        </div>
        <div className="min-w-0 space-y-4">
          <ProxySettingsSection
            form={form}
            update={update}
            isSaving={isSaving}
            canSave={providers.length > 0}
            initialPackageId={initialPackage?.id}
          />
          <ProxyPreviewSection form={form} isEdit={isEdit} />
        </div>
      </form>
    </div>
  )
}
