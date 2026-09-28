import { Building2, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ProviderCategory } from '@/features/admin/catalog/services/providerCategoryService'
import { HostingCard, HostingField, hostingInputClass } from './HostingFormUi'

type Props = {
  providers: ProviderCategory[]
  providerCategoryId: string
  onChange: (value: string) => void
}

export function HostingProviderSection({
  providers,
  providerCategoryId,
  onChange,
}: Props) {
  const { t } = useTranslation('catalog')
  const selected = providers.find(
    (provider) => provider.id === providerCategoryId,
  )
  return (
    <HostingCard icon={Building2} title={t('hosting.new.providerSection')}>
      <HostingField
        label={t('hosting.new.defaultProvider')}
        required
        hint={t('hosting.new.providerHint')}
      >
        <select
          required
          className={hostingInputClass}
          value={providerCategoryId}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{t('hosting.new.selectProvider')}</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </HostingField>
      {selected ? (
        <div className="mt-4 rounded-md border border-[#d5e1f2] bg-[#f7faff] p-3 text-sm text-[#5b7093]">
          <p className="mb-2 flex items-center gap-2 font-semibold text-[#11184c]">
            <Info className="size-4 text-blue-600" />
            {t('hosting.new.providerInfo')}
          </p>
          <p>
            {t('hosting.new.providerName')}: {selected.name}
          </p>
          {selected.description && (
            <p className="mt-1">{selected.description}</p>
          )}
          <p className="mt-1">
            {t('hosting.new.providerStatus')}:{' '}
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
              {t('hosting.new.active')}
            </span>
          </p>
        </div>
      ) : providers.length === 0 ? (
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-700">
          {t('hosting.new.providerMissing')}
        </p>
      ) : null}
    </HostingCard>
  )
}
