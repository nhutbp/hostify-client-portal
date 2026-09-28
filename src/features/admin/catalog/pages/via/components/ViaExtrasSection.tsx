import { Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ViaCard } from './ViaFormUi'
import { viaExtraKeys } from './viaFormTypes'
import type { ViaFormDraft } from './viaFormTypes'

export function ViaExtrasSection({
  form,
  update,
}: {
  form: ViaFormDraft
  update: (patch: Partial<ViaFormDraft>) => void
}) {
  const { t } = useTranslation('catalog')
  return (
    <ViaCard icon={Settings2} title={t('via.new.extras')}>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {viaExtraKeys.map((key) => (
          <label
            key={key}
            className="flex items-center gap-2 rounded-md border border-[#d5e1f2] px-3 py-2 text-sm"
          >
            <input
              type="checkbox"
              checked={form[key]}
              onChange={(event) => update({ [key]: event.target.checked })}
            />
            {t(`via.extras.${key}`)}
          </label>
        ))}
      </div>
    </ViaCard>
  )
}
