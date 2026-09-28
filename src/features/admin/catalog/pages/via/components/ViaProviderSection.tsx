import { Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ProviderCategory } from '@/features/admin/catalog/services/providerCategoryService'
import { ViaCard, ViaField, viaInputClass } from './ViaFormUi'
import type { ViaFormDraft } from './viaFormTypes'

export function ViaProviderSection({
  form,
  update,
  providers,
}: {
  form: ViaFormDraft
  update: (patch: Partial<ViaFormDraft>) => void
  providers: ProviderCategory[]
}) {
  const { t } = useTranslation('catalog')
  const selected = providers.find(
    (provider) => provider.id === form.providerCategoryId,
  )
  return (
    <ViaCard icon={Building2} title={t('via.new.providerSection')}>
      <ViaField
        name="providerCategoryId"
        label={t('via.new.provider')}
        required
      >
        <select
          id="providerCategoryId"
          name="providerCategoryId"
          className={viaInputClass}
          value={form.providerCategoryId}
          onChange={(event) =>
            update({ providerCategoryId: event.target.value })
          }
        >
          <option value="">{t('via.new.selectProvider')}</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </ViaField>
      <p className="mt-2 text-xs text-slate-500">{t('via.new.providerHint')}</p>
      {selected && (
        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">
          <p className="font-semibold text-[#11184c]">
            {t('via.new.providerInfo')}
          </p>
          <p className="mt-1 text-slate-600">{selected.name}</p>
          {selected.description && (
            <p className="mt-1 text-slate-500">{selected.description}</p>
          )}
        </div>
      )}
      {providers.length === 0 && (
        <p className="mt-3 text-sm text-amber-700">
          {t('via.new.providerMissing')}
        </p>
      )}
    </ViaCard>
  )
}
