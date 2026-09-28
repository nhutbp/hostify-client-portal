import { Server } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { HostingCard, HostingField, hostingInputClass } from './HostingFormUi'
import type { HostingFormDraft } from './hostingFormTypes'

type Props = {
  form: HostingFormDraft
  update: (patch: Partial<HostingFormDraft>) => void
}

const numericFields = [
  { key: 'websites', label: 'websites', hint: 'unlimitedHint', required: true },
  {
    key: 'databases',
    label: 'databases',
    hint: 'unlimitedHint',
    required: true,
  },
  { key: 'cpuCores', label: 'cpu', hint: 'cpuHint', required: false },
  {
    key: 'emailAccounts',
    label: 'email',
    hint: 'unlimitedHint',
    required: false,
  },
  {
    key: 'addonDomains',
    label: 'addonDomains',
    hint: 'unlimitedHint',
    required: false,
  },
] as const

const featureFields = [
  'controlPanel',
  'freeSsl',
  'automaticBackups',
  'malwareProtection',
  'freeDomain',
  'multiplePhpVersions',
  'cronJobs',
  'staging',
] as const

export function HostingResourcesSection({ form, update }: Props) {
  const { t } = useTranslation('catalog')
  return (
    <HostingCard icon={Server} title={t('hosting.new.resources')}>
      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2 md:grid-cols-3">
        <HostingField
          label={t('hosting.new.storage')}
          required
          hint={t('hosting.new.storageHint')}
        >
          <div className="flex">
            <input
              type="number"
              required
              min="1"
              className={`${hostingInputClass} rounded-r-none`}
              value={form.storageGb}
              onChange={(event) => update({ storageGb: event.target.value })}
            />
            <select
              aria-label={t('hosting.new.storage')}
              className="rounded-r-md border border-l-0 border-[#d5e1f2] bg-slate-50 px-2 text-sm"
              value={form.storageUnit}
              onChange={(event) =>
                update({ storageUnit: event.target.value as 'GB' | 'TB' })
              }
            >
              <option>GB</option>
              <option>TB</option>
            </select>
          </div>
        </HostingField>
        <HostingField
          label={t('hosting.new.bandwidth')}
          required
          hint={t('hosting.new.bandwidthHint')}
        >
          <div className="flex">
            <input
              type="number"
              required
              min="-1"
              className={`${hostingInputClass} rounded-r-none`}
              value={form.bandwidthGb}
              onChange={(event) => update({ bandwidthGb: event.target.value })}
            />
            <select
              aria-label={t('hosting.new.bandwidth')}
              className="rounded-r-md border border-l-0 border-[#d5e1f2] bg-slate-50 px-2 text-sm"
              value={form.bandwidthUnit}
              onChange={(event) =>
                update({ bandwidthUnit: event.target.value as 'GB' | 'TB' })
              }
            >
              <option>GB</option>
              <option>TB</option>
            </select>
          </div>
        </HostingField>
        {numericFields.slice(0, 2).map(({ key, label, hint, required }) => (
          <HostingField
            key={key}
            label={t(`hosting.new.${label}`)}
            required={required}
            hint={t(`hosting.new.${hint}`)}
          >
            <input
              type="number"
              min="-1"
              required={required}
              className={hostingInputClass}
              value={form[key]}
              onChange={(event) => update({ [key]: event.target.value })}
            />
          </HostingField>
        ))}
        <HostingField
          label={t('hosting.new.cpu')}
          hint={t('hosting.new.cpuHint')}
        >
          <input
            type="number"
            min="0"
            className={hostingInputClass}
            value={form.cpuCores}
            onChange={(event) => update({ cpuCores: event.target.value })}
          />
        </HostingField>
        <HostingField
          label={t('hosting.new.ram')}
          hint={t('hosting.new.ramHint')}
        >
          <div className="flex">
            <input
              type="number"
              min="0"
              className={`${hostingInputClass} rounded-r-none`}
              value={form.ramGb}
              onChange={(event) => update({ ramGb: event.target.value })}
            />
            <span className="flex shrink-0 items-center justify-center whitespace-nowrap rounded-r-md border border-l-0 border-[#d5e1f2] bg-slate-50 px-3 text-sm">
              GB
            </span>
          </div>
        </HostingField>
        {numericFields.slice(3).map(({ key, label, hint }) => (
          <HostingField
            key={key}
            label={t(`hosting.new.${label}`)}
            hint={t(`hosting.new.${hint}`)}
          >
            <input
              type="number"
              min="-1"
              className={hostingInputClass}
              value={form[key]}
              onChange={(event) => update({ [key]: event.target.value })}
            />
          </HostingField>
        ))}
      </div>
      <h3 className="mb-2.5 mt-7 text-sm font-semibold text-[#11184c]">
        {t('hosting.new.additionalFeatures')}
      </h3>
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {featureFields.map((key) => (
          <label
            key={key}
            className="flex min-h-10 items-center gap-2 rounded-md border border-[#d5e1f2] px-2.5 text-sm text-[#11184c]"
          >
            <input
              type="checkbox"
              className="size-4 accent-blue-600"
              checked={form[key]}
              onChange={(event) => update({ [key]: event.target.checked })}
            />
            {t(`hosting.new.${key}`)}
          </label>
        ))}
      </div>
    </HostingCard>
  )
}
