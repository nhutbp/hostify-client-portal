import { ServerCog } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ViaCard, ViaField, viaInputClass } from './ViaFormUi'
import type { ViaFormDraft } from './viaFormTypes'

type SelectKey =
  | 'platform'
  | 'country'
  | 'accountType'
  | 'accountAge'
  | 'verification'
  | 'changeLimit'
  | 'deliveryMethod'
  | 'warrantyDays'
const options: Record<SelectKey, string[]> = {
  platform: ['FACEBOOK', 'GOOGLE', 'TIKTOK'],
  country: ['US', 'VN', 'SG', 'JP', 'DE'],
  accountType: ['VIA', 'BM', 'ADS'],
  accountAge: ['NEW', 'SIX_MONTHS', 'ONE_YEAR'],
  verification: ['VERIFIED', 'UNVERIFIED'],
  changeLimit: ['UNLIMITED', 'LIMITED', 'NO_CHANGE'],
  deliveryMethod: ['ACCOUNT_PASSWORD', 'ACCOUNT_PASSWORD_2FA'],
  warrantyDays: ['0', '3', '7', '14', '30'],
}
const required: SelectKey[] = [
  'platform',
  'country',
  'accountType',
  'verification',
  'deliveryMethod',
  'warrantyDays',
]

export function ViaConfigurationSection({
  form,
  update,
}: {
  form: ViaFormDraft
  update: (patch: Partial<ViaFormDraft>) => void
}) {
  const { t } = useTranslation('catalog')
  const selectFields: SelectKey[] = [
    'platform',
    'country',
    'accountType',
    'accountAge',
    'verification',
    'changeLimit',
    'deliveryMethod',
    'warrantyDays',
  ]
  return (
    <ViaCard icon={ServerCog} title={t('via.new.configuration')}>
      <div className="grid gap-5 md:grid-cols-3">
        {selectFields.slice(0, 5).map((field) => (
          <ViaField
            key={field}
            name={field}
            label={t(`via.new.${field}`)}
            required={required.includes(field)}
          >
            <select
              id={field}
              name={field}
              className={viaInputClass}
              value={form[field]}
              onChange={(event) => update({ [field]: event.target.value })}
            >
              {options[field].map((option) => (
                <option key={option} value={option}>
                  {t(`via.options.${field}.${option}`)}
                </option>
              ))}
            </select>
          </ViaField>
        ))}
        <ViaField name="twoFactor" label={t('via.new.twoFactor')}>
          <select
            id="twoFactor"
            name="twoFactor"
            className={viaInputClass}
            value={form.twoFactor ? 'true' : 'false'}
            onChange={(event) =>
              update({ twoFactor: event.target.value === 'true' })
            }
          >
            <option value="true">{t('via.options.twoFactor.true')}</option>
            <option value="false">{t('via.options.twoFactor.false')}</option>
          </select>
        </ViaField>
        {selectFields.slice(5).map((field) => (
          <ViaField
            key={field}
            name={field}
            label={t(`via.new.${field}`)}
            required={required.includes(field)}
          >
            <select
              id={field}
              name={field}
              className={viaInputClass}
              value={form[field]}
              onChange={(event) => update({ [field]: event.target.value })}
            >
              {options[field].map((option) => (
                <option key={option} value={option}>
                  {t(`via.options.${field}.${option}`)}
                </option>
              ))}
            </select>
          </ViaField>
        ))}
      </div>
    </ViaCard>
  )
}
