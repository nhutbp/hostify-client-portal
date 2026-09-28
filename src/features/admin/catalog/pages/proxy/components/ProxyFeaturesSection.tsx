import { Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProxyCard } from './ProxyFormUi'
import { proxyFeatureKeys } from './proxyFormTypes'
import type { ProxyFormDraft } from './proxyFormTypes'

export function ProxyFeaturesSection({
  form,
  update,
}: {
  form: ProxyFormDraft
  update: (patch: Partial<ProxyFormDraft>) => void
}) {
  const { t } = useTranslation('catalog')
  return (
    <ProxyCard icon={Settings2} title={t('proxy.new.features')}>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {proxyFeatureKeys.map((key) => (
          <label
            key={key}
            className="flex items-center gap-2 rounded-md border border-[#d5e1f2] px-3 py-2 text-sm"
          >
            <input
              type="checkbox"
              checked={form[key]}
              onChange={(event) => update({ [key]: event.target.checked })}
            />
            {t(`proxy.features.${key}`)}
          </label>
        ))}
      </div>
    </ProxyCard>
  )
}
