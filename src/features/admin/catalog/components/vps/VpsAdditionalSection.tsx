import { useState } from 'react'
import { Info, Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { vpsOperatingSystems } from '../../data/operatingSystems'
import { Section, vpsInputClass } from './VpsFormFields'

type DatacenterOption = {
  id: string
  name: string
  countryCode: string
}

type Props = {
  operatingSystem: string
  onOperatingSystemChange: (value: string) => void
  datacenterIds: string[]
  datacenters: DatacenterOption[]
  onToggleDatacenter: (id: string) => void
}

const flags: Record<string, string> = {
  VN: '🇻🇳',
  SG: '🇸🇬',
  JP: '🇯🇵',
  US: '🇺🇸',
  DE: '🇩🇪',
}

export function VpsAdditionalSection({
  operatingSystem,
  onOperatingSystemChange,
  datacenterIds,
  datacenters,
  onToggleDatacenter,
}: Props) {
  const { t } = useTranslation('catalog')
  const [activeTab, setActiveTab] = useState<'os' | 'location'>('os')

  return (
    <Section icon={Settings2} title={t('vps.form.additional')}>
      <div
        role="tablist"
        aria-label={t('vps.form.additional')}
        className="flex border-b border-[#d6e2f6] text-xs"
      >
        {(['os', 'location'] as const).map((tab) => (
          <button
            key={tab}
            id={`vps-additional-tab-${tab}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls="vps-additional-panel"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 border-b-2 py-1.5 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-[#506181]'}`}
          >
            {t(`vps.form.${tab === 'location' ? 'datacenters' : 'os'}`)}
          </button>
        ))}
      </div>
      <div
        id="vps-additional-panel"
        role="tabpanel"
        aria-labelledby={`vps-additional-tab-${activeTab}`}
        className="min-h-[145px] space-y-1 py-2.5"
      >
        {activeTab === 'os' ? (
          <label
            className="block text-xs text-[#26385c]"
            htmlFor="vps-operating-system"
          >
            <span className="mb-1 block font-medium">
              {t('vps.form.defaultOs')}
            </span>
            <select
              id="vps-operating-system"
              className={vpsInputClass}
              value={operatingSystem}
              onChange={(event) => onOperatingSystemChange(event.target.value)}
            >
              {vpsOperatingSystems.map((system) => (
                <option key={system} value={system}>
                  {system}
                </option>
              ))}
            </select>
          </label>
        ) : datacenters.length ? (
          datacenters.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2 text-xs text-[#26385c]"
            >
              <input
                type="checkbox"
                className="size-3.5"
                checked={datacenterIds.includes(item.id)}
                onChange={() => onToggleDatacenter(item.id)}
              />
              <span className="text-base leading-none">
                {flags[item.countryCode] ?? '🌐'}
              </span>
              {item.name}
            </label>
          ))
        ) : (
          <p className="text-xs text-slate-500">
            {t('vps.form.noDatacenters')}
          </p>
        )}
      </div>
      <div className="flex items-start gap-2 rounded-[5px] bg-[#eaf4ff] px-2.5 py-2 text-[11px] leading-4 text-[#31568f]">
        <Info className="mt-0.5 size-3.5 shrink-0 text-blue-600" />
        {t(activeTab === 'os' ? 'vps.form.osHint' : 'vps.form.datacenterHint')}
      </div>
    </Section>
  )
}
