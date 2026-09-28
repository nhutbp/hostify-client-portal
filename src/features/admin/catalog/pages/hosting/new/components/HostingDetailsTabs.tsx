import { useEffect, useId, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProviderCategory } from '@/features/admin/catalog/services/providerCategoryService'
import { HostingPricingSection } from './HostingPricingSection'
import { HostingProviderSection } from './HostingProviderSection'
import { HostingResourcesSection } from './HostingResourcesSection'
import type { HostingDetailsTab, HostingFormDraft } from './hostingFormTypes'

type Props = {
  form: HostingFormDraft
  update: (patch: Partial<HostingFormDraft>) => void
  providers: ProviderCategory[]
  errorTab: HostingDetailsTab | null
  validationAttempt: number
}

const tabs: HostingDetailsTab[] = ['resources', 'pricing', 'provider']
const labelKeys: Record<HostingDetailsTab, string> = {
  resources: 'hosting.new.resources',
  pricing: 'hosting.new.pricing',
  provider: 'hosting.new.providerSection',
}

export function HostingDetailsTabs({
  form,
  update,
  providers,
  errorTab,
  validationAttempt,
}: Props) {
  const { t } = useTranslation('catalog')
  const id = useId()
  const [activeTab, setActiveTab] = useState<HostingDetailsTab>('resources')

  useEffect(() => {
    if (errorTab) setActiveTab(errorTab)
  }, [errorTab, validationAttempt])

  const onTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const nextIndex =
      event.key === 'ArrowRight'
        ? (index + 1) % tabs.length
        : event.key === 'ArrowLeft'
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? tabs.length - 1
              : -1
    if (nextIndex < 0) return
    event.preventDefault()
    setActiveTab(tabs[nextIndex])
    document.getElementById(`${id}-${tabs[nextIndex]}-tab`)?.focus()
  }

  return (
    <div className="min-w-0">
      <div
        role="tablist"
        aria-label={t('hosting.new.packageDetails')}
        className="flex min-w-0 gap-1 overflow-x-auto rounded-t-xl border-b border-[#dce6f5] bg-white p-2 shadow-sm ring-1 ring-slate-100"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab}
            id={`${id}-${tab}-tab`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`${id}-${tab}-panel`}
            tabIndex={activeTab === tab ? 0 : -1}
            onClick={() => setActiveTab(tab)}
            onKeyDown={(event) => onTabKeyDown(event, index)}
            className={`shrink-0 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-[#607397] hover:bg-blue-50 hover:text-blue-600'}`}
          >
            {t(labelKeys[tab])}
          </button>
        ))}
      </div>
      <div
        id={`${id}-resources-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-resources-tab`}
        hidden={activeTab !== 'resources'}
        tabIndex={0}
        className="pt-2"
      >
        <HostingResourcesSection form={form} update={update} />
      </div>
      <div
        id={`${id}-pricing-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-pricing-tab`}
        hidden={activeTab !== 'pricing'}
        tabIndex={0}
        className="pt-2"
      >
        <HostingPricingSection form={form} update={update} />
      </div>
      <div
        id={`${id}-provider-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-provider-tab`}
        hidden={activeTab !== 'provider'}
        tabIndex={0}
        className="pt-2"
      >
        <HostingProviderSection
          providers={providers}
          providerCategoryId={form.providerCategoryId}
          onChange={(providerCategoryId) => update({ providerCategoryId })}
        />
      </div>
    </div>
  )
}
