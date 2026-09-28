import type { KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'

export type VpsDetailsTab = 'hardware' | 'pricing' | 'provider' | 'additional'

const tabs: VpsDetailsTab[] = ['hardware', 'pricing', 'provider', 'additional']
const labelKeys: Record<VpsDetailsTab, string> = {
  hardware: 'vps.form.sectionHardware',
  pricing: 'vps.form.sectionPricing',
  provider: 'vps.form.sectionProvider',
  additional: 'vps.form.additional',
}

export function VpsDetailsTabs({
  activeTab,
  onChange,
}: {
  activeTab: VpsDetailsTab
  onChange: (tab: VpsDetailsTab) => void
}) {
  const { t } = useTranslation('catalog')

  const onKeyDown = (
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
    const nextTab = tabs[nextIndex]
    onChange(nextTab)
    document.getElementById(`vps-details-${nextTab}-tab`)?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={t('vps.form.packageDetails')}
      className="grid min-w-0 grid-cols-2 gap-1 rounded-t-xl border-b border-[#dce6f5] bg-white p-2 shadow-sm ring-1 ring-slate-100 sm:grid-cols-4"
    >
      {tabs.map((tab, index) => (
        <button
          key={tab}
          id={`vps-details-${tab}-tab`}
          type="button"
          role="tab"
          aria-selected={activeTab === tab}
          aria-controls={`vps-details-${tab}-panel`}
          tabIndex={activeTab === tab ? 0 : -1}
          onClick={() => onChange(tab)}
          onKeyDown={(event) => onKeyDown(event, index)}
          className={`min-w-0 rounded-md px-2 py-2.5 text-center text-sm font-semibold leading-5 transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-[#607397] hover:bg-blue-50 hover:text-blue-600'}`}
        >
          {t(labelKeys[tab])}
        </button>
      ))}
    </div>
  )
}
