import { Cpu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  PhysicalCard,
  PhysicalField,
  physicalInputClass,
} from './PhysicalFormUi'
import type { PhysicalFormDraft } from './physicalFormTypes'

export function PhysicalResourcesSection({
  form,
  update,
}: {
  form: PhysicalFormDraft
  update: (patch: Partial<PhysicalFormDraft>) => void
}) {
  const { t } = useTranslation('catalog')
  const numberField = (
    key: 'cpuCores' | 'ramGb' | 'storageGb' | 'bandwidthMbps' | 'ipCount',
    label: string,
  ) => (
    <PhysicalField name={key} label={label} required>
      <input
        id={key}
        name={key}
        type="number"
        min="1"
        required
        className={physicalInputClass}
        value={form[key]}
        onChange={(event) => update({ [key]: event.target.value })}
      />
    </PhysicalField>
  )
  return (
    <PhysicalCard icon={Cpu} title={t('physical.new.resources')}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <PhysicalField
          name="cpuModel"
          label={t('physical.new.cpuModel')}
          required
        >
          <input
            id="cpuModel"
            name="cpuModel"
            required
            className={physicalInputClass}
            value={form.cpuModel}
            onChange={(event) => update({ cpuModel: event.target.value })}
          />
        </PhysicalField>
        {numberField('cpuCores', t('physical.new.cpuCores'))}
        {numberField('ramGb', t('physical.new.ramGb'))}
        {numberField('storageGb', t('physical.new.storageGb'))}
        <PhysicalField
          name="storageType"
          label={t('physical.new.storageType')}
          required
        >
          <select
            id="storageType"
            name="storageType"
            className={physicalInputClass}
            value={form.storageType}
            onChange={(event) =>
              update({
                storageType: event.target
                  .value as PhysicalFormDraft['storageType'],
              })
            }
          >
            <option value="NVME">NVMe SSD</option>
            <option value="SSD">SSD</option>
            <option value="HDD">HDD</option>
          </select>
        </PhysicalField>
        {numberField('bandwidthMbps', t('physical.new.bandwidthMbps'))}
        {numberField('ipCount', t('physical.new.ipCount'))}
        <PhysicalField name="location" label={t('physical.new.location')}>
          <input
            id="location"
            name="location"
            className={physicalInputClass}
            value={form.location}
            onChange={(event) => update({ location: event.target.value })}
          />
        </PhysicalField>
      </div>
    </PhysicalCard>
  )
}
