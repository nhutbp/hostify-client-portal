import { Link } from '@tanstack/react-router'
import { ArrowLeft, Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PhysicalBasicSection } from '../new/components/PhysicalBasicSection'
import { PhysicalResourcesSection } from '../new/components/PhysicalResourcesSection'
import { PhysicalPricingSection } from '../new/components/PhysicalPricingSection'
import { PhysicalPublishingSection } from '../new/components/PhysicalPublishingSection'
import {
  PhysicalCard,
  PhysicalField,
  physicalInputClass,
} from '../new/components/PhysicalFormUi'
import { usePhysicalPackageForm } from '../new/components/usePhysicalPackageForm'
import type { PhysicalPackageDetail } from '../../../services/physicalService'

export function PhysicalPackageFormPage({
  initialPackage,
}: {
  initialPackage?: PhysicalPackageDetail
}) {
  const { t, i18n } = useTranslation('catalog')
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
  } = usePhysicalPackageForm(initialPackage)
  const selectedProvider = providers.find(
    (provider) => provider.id === form.providerCategoryId,
  )
  return (
    <div className="-mx-4 min-h-[calc(100vh-58px)] px-4 pb-8 pt-3 md:-mx-7 md:-my-7 md:px-5 md:pt-4">
      <p className="mb-2 text-sm text-[#6a7d9f]">
        {t(isEdit ? 'physical.edit.breadcrumb' : 'physical.new.breadcrumb')}
      </p>
      <header className="mb-5 flex items-center gap-4">
        <Link
          to={
            isEdit
              ? '/dashboard/catalog/physical/$id'
              : '/dashboard/catalog/physical'
          }
          params={initialPackage ? { id: initialPackage.id } : undefined}
          aria-label={t('physical.new.cancel')}
          className="flex size-11 items-center justify-center rounded-md border border-[#d5e1f2] bg-white"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#11184c]">
            {t(isEdit ? 'physical.edit.title' : 'physical.new.title')}
          </h1>
          <p className="mt-1 text-base text-[#667a9b]">
            {t(isEdit ? 'physical.edit.subtitle' : 'physical.new.subtitle')}
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
        onSubmit={onSubmit}
        noValidate
        className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]"
      >
        <div className="min-w-0 space-y-4">
          <PhysicalBasicSection
            form={form}
            update={update}
            onNameChange={onNameChange}
            onSlugChange={onSlugChange}
          />
          <PhysicalResourcesSection form={form} update={update} />
          <PhysicalPricingSection form={form} update={update} />
        </div>
        <div className="min-w-0 space-y-4">
          <PhysicalPublishingSection
            form={form}
            update={update}
            isSaving={isSaving}
            canSave={providers.length > 0}
            initialPackageId={initialPackage?.id}
          />
          <PhysicalCard
            icon={Building2}
            title={t('physical.new.providerSection')}
          >
            <PhysicalField
              name="providerCategoryId"
              label={t('physical.new.provider')}
              required
            >
              <select
                id="providerCategoryId"
                name="providerCategoryId"
                required
                className={physicalInputClass}
                value={form.providerCategoryId}
                onChange={(event) =>
                  update({ providerCategoryId: event.target.value })
                }
              >
                <option value="">{t('physical.new.selectProvider')}</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </PhysicalField>
            {selectedProvider?.description && (
              <p className="mt-3 text-sm text-slate-500">
                {selectedProvider.description}
              </p>
            )}
            {providers.length === 0 && (
              <p className="mt-3 text-sm text-amber-700">
                {t('physical.new.providerMissing')}
              </p>
            )}
          </PhysicalCard>
          <PhysicalCard icon={Building2} title={t('physical.new.preview')}>
            <p className="text-lg font-bold text-[#11184c]">
              {form.name || t('physical.new.unnamedPackage')}
            </p>
            <p className="mt-1 text-sm text-slate-500">{form.description}</p>
            <p className="mt-3 text-xl font-bold text-blue-600">
              {Number(form.defaultPrice || 0).toLocaleString(i18n.language)} ₫/
              {t('physical.monthly')}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {form.cpuModel || '—'} · {form.cpuCores} {t('physical.new.cores')}{' '}
              · {form.ramGb} GB RAM · {form.storageGb} GB {form.storageType}
            </p>
          </PhysicalCard>
        </div>
      </form>
    </div>
  )
}
