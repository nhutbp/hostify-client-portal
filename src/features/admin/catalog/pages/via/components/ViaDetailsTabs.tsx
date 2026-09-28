import { useEffect, useId, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProviderCategory } from '@/features/admin/catalog/services/providerCategoryService'
import { ViaConfigurationSection } from './ViaConfigurationSection'
import { ViaExtrasSection } from './ViaExtrasSection'
import { ViaPricingSection } from './ViaPricingSection'
import { ViaProviderSection } from './ViaProviderSection'
import type { ViaDetailsTab, ViaFormDraft } from './viaFormTypes'

const tabs: ViaDetailsTab[] = ['configuration', 'extras', 'pricing', 'provider']
const labelKeys: Record<ViaDetailsTab, string> = {
  configuration: 'via.new.configuration',
  extras: 'via.new.extras',
  pricing: 'via.new.pricing',
  provider: 'via.new.providerSection',
}
export function ViaDetailsTabs({
  form,
  update,
  providers,
  errorTab,
  validationAttempt,
}: {
  form: ViaFormDraft
  update: (patch: Partial<ViaFormDraft>) => void
  providers: ProviderCategory[]
  errorTab: ViaDetailsTab | null
  validationAttempt: number
}) {
  const { t } = useTranslation('catalog')
  const id = useId()
  const [activeTab, setActiveTab] = useState<ViaDetailsTab>('configuration')
  useEffect(() => {
    if (errorTab) setActiveTab(errorTab)
  }, [errorTab, validationAttempt])
  const onTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % tabs.length
        : event.key === 'ArrowLeft'
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? tabs.length - 1
              : -1
    if (next < 0) return
    event.preventDefault()
    setActiveTab(tabs[next])
    document.getElementById(`${id}-${tabs[next]}-tab`)?.focus()
  }
  return (
    <div className="min-w-0">
      <div
        role="tablist"
        aria-label={t('via.new.packageDetails')}
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
        id={`${id}-configuration-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-configuration-tab`}
        hidden={activeTab !== 'configuration'}
        tabIndex={0}
        className="pt-2"
      >
        <ViaConfigurationSection form={form} update={update} />
      </div>
      <div
        id={`${id}-extras-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-extras-tab`}
        hidden={activeTab !== 'extras'}
        tabIndex={0}
        className="pt-2"
      >
        <ViaExtrasSection form={form} update={update} />
      </div>
      <div
        id={`${id}-pricing-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-pricing-tab`}
        hidden={activeTab !== 'pricing'}
        tabIndex={0}
        className="pt-2"
      >
        <ViaPricingSection form={form} update={update} />
      </div>
      <div
        id={`${id}-provider-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-provider-tab`}
        hidden={activeTab !== 'provider'}
        tabIndex={0}
        className="pt-2"
      >
        <ViaProviderSection form={form} update={update} providers={providers} />
      </div>
    </div>
  )
}
